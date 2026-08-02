"use client";

/**
 * Cycles fit-width → fit-height → fit-page through a single control.
 *
 * The button shows the **last applied** fit mode (or `initialMode` before the
 * first apply). Click semantics:
 * - LED off (`isActive` false) → re-apply the **shown** mode only (no advance)
 * - LED on → apply the *next* mode and update the label to match
 *
 * That way a dimmed “width” after manual zoom re-enables width; cycling to
 * height/page only happens while the shown fit is already active.
 *
 * With {@link UseCyclingFitModeOptions.applyInitialFit}, `initialMode`
 * is applied once the viewport can measure a fit (default off — label-only
 * until the first click).
 *
 * `isActive` is true only while the current zoom still matches that mode’s
 * computed fit scale (within {@link PDF_FIT_SCALE_EPSILON}). Manual zoom
 * turns the LED off without changing the label.
 *
 * Container-resize tracking lives in `usePdfViewportScale`
 * (`fitMode` + `fitOnResize`): applying a fit through this cycle records the
 * active policy on the viewport, so with `fitOnResize` on (the default) the
 * scale — and therefore this LED — stays lit across container resizes. With
 * tracking off, a resize leaves the scale stale and the LED correctly drops.
 */

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { isFitScaleActive, PDF_FIT_SCALE_EPSILON } from "./fit-scale";
import type { UsePdfViewportScaleReturn } from "./use-pdf-viewport-scale";

export type PdfFitMode = "width" | "height" | "page";

export interface PdfFitModeDescriptor {
  mode: PdfFitMode;
  /** Short text label — no glyphs; hosts may lowercase for chrome. */
  label: string;
  title: string;
}

export const PDF_FIT_MODE_ORDER: readonly PdfFitMode[] = [
  "width",
  "height",
  "page",
] as const;

const FIT_MODE_DESCRIPTORS: Record<PdfFitMode, PdfFitModeDescriptor> = {
  width: {
    mode: "width",
    label: "Width",
    title: "Fit width",
  },
  height: {
    mode: "height",
    label: "Height",
    title: "Fit height",
  },
  page: {
    mode: "page",
    label: "Page",
    title: "Fit page",
  },
};

export function getPdfFitModeDescriptor(
  mode: PdfFitMode,
): PdfFitModeDescriptor {
  return FIT_MODE_DESCRIPTORS[mode];
}

/**
 * Fixed width on the fit-cycle button (scales with button font-size via `ch`).
 * Sized for longest text label ("Height") + LED + typical `px-2` padding under
 * border-box — keep width on the outer control, not only the inner label.
 *
 * Prefer {@link PDF_FIT_CYCLE_BUTTON_STYLE} when the host may purge Tailwind.
 */
export const PDF_FIT_CYCLE_BUTTON_CLASS =
  "inline-flex h-7 w-[9ch] shrink-0 items-center justify-center whitespace-nowrap";

/** Inner row; outer {@link PDF_FIT_CYCLE_BUTTON_CLASS} holds stable width. */
export const PDF_FIT_CYCLE_LABEL_CLASS =
  "inline-flex items-center justify-center gap-1";

/**
 * LED disk — space reserved in both states so the button width never jumps.
 * Pair with {@link PDF_FIT_CYCLE_LED_ON_CLASS} / {@link PDF_FIT_CYCLE_LED_OFF_CLASS}.
 */
export const PDF_FIT_CYCLE_LED_CLASS =
  "inline-block size-1.5 shrink-0 rounded-full bg-current";

/** Fit scale currently matches the shown mode. */
export const PDF_FIT_CYCLE_LED_ON_CLASS = `${PDF_FIT_CYCLE_LED_CLASS} opacity-90`;

/** Fit scale does not match — invisible but still occupies layout. */
export const PDF_FIT_CYCLE_LED_OFF_CLASS = `${PDF_FIT_CYCLE_LED_CLASS} opacity-0`;

/**
 * Active chrome for the fit-cycle control when `aria-pressed` is true.
 * Distinct fill + border + weight (not opacity-only).
 */
export const PDF_FIT_CYCLE_ACTIVE_CLASS =
  "aria-pressed:bg-current/15 aria-pressed:border-current/50 aria-pressed:font-semibold";

/**
 * Identical fixed square for zoom − / + so glyph width cannot skew the strip.
 * Shared toolbar control height is 28px (`h-7`) — pair with a chrome class;
 * prefer `p-0` (or override padding) on the host.
 */
export const PDF_ZOOM_STEP_BUTTON_CLASS =
  "inline-flex size-7 shrink-0 items-center justify-center p-0";

/**
 * Fixed width for zoom percent — sized for max label `"300%"` with padding.
 * Also set {@link PDF_ZOOM_PERCENT_BUTTON_STYLE} so purge cannot drop the lock.
 */
export const PDF_ZOOM_PERCENT_BUTTON_CLASS =
  "inline-flex h-7 w-[7ch] shrink-0 items-center justify-center whitespace-nowrap text-center tabular-nums";

/** Longest zoom percent label this control is sized for (max scale 300%). */
export const PDF_ZOOM_PERCENT_MAX_LABEL = "300%";

/**
 * Purge-proof layout for the zoom percent control. Apply via `style={…}` —
 * does not depend on Tailwind scanning imported class-string constants.
 * Tabular nums keep ##% / ###% stable without forcing a monospace face.
 */
export const PDF_ZOOM_PERCENT_BUTTON_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: "7ch",
  minWidth: "7ch",
  height: 28,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
};

/** Purge-proof equal squares for zoom − / + (shared 28px toolbar height). */
export const PDF_ZOOM_STEP_BUTTON_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: 28,
  height: 28,
  minWidth: 28,
  padding: 0,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Purge-proof fixed width for the fit-cycle control (text + LED). */
export const PDF_FIT_CYCLE_BUTTON_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: "9ch",
  minWidth: "9ch",
  height: 28,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

export function nextPdfFitMode(mode: PdfFitMode): PdfFitMode {
  const index = PDF_FIT_MODE_ORDER.indexOf(mode);
  const nextIndex = (index + 1) % PDF_FIT_MODE_ORDER.length;
  return PDF_FIT_MODE_ORDER[nextIndex] ?? "width";
}

/**
 * Which fit mode a click should apply.
 * Inactive / never applied → shown mode (re-enable). Active → next in cycle.
 */
export function resolveCyclingFitApplyMode(
  lastApplied: PdfFitMode | null,
  initialMode: PdfFitMode,
  isActive: boolean,
): PdfFitMode {
  const shown = lastApplied ?? initialMode;
  return lastApplied !== null && isActive
    ? nextPdfFitMode(lastApplied)
    : shown;
}

/**
 * Tooltip / aria for the fit-cycle control.
 * When `next` equals `current`, click re-applies (LED off / first apply);
 * otherwise click advances to `next`.
 */
export function getPdfFitCycleTitle(
  current: PdfFitModeDescriptor,
  next: PdfFitModeDescriptor,
): string {
  if (current.mode === next.mode) {
    return `${current.title} — click to apply`;
  }
  return `${current.title} — click for ${next.label.toLowerCase()}`;
}

export type CyclingFitViewport = Pick<
  UsePdfViewportScaleReturn,
  "fitWidth" | "fitHeight" | "fitPage" | "canFit" | "scale" | "getFitScale"
>;

export interface UseCyclingFitModeOptions {
  /**
   * Mode applied (and shown) on the first click — and, when
   * {@link UseCyclingFitModeOptions.applyInitialFit} is set, on first ready
   * layout. Default: `"width"`.
   * Until applied, the control shows this as the pending fit.
   */
  initialMode?: PdfFitMode;
  /**
   * Absolute scale epsilon for {@link UseCyclingFitModeReturn.isActive}.
   * Default: {@link PDF_FIT_SCALE_EPSILON}.
   */
  activeEpsilon?: number;
  /**
   * Apply {@link UseCyclingFitModeOptions.initialMode} once the viewport can
   * compute a fit scale (page size known and container has measurable size).
   * Default: `false` (label-only until the first click).
   */
  applyInitialFit?: boolean;
}

export interface UseCyclingFitModeReturn {
  /**
   * Fit mode shown on the control — last applied, or `initialMode` before
   * the first click.
   */
  mode: PdfFitMode;
  /**
   * Mode that the next `cycleFit()` will apply — the shown mode when inactive
   * (re-enable), otherwise the next mode in the cycle.
   */
  nextMode: PdfFitMode;
  descriptor: PdfFitModeDescriptor;
  nextDescriptor: PdfFitModeDescriptor;
  canFit: boolean;
  /**
   * True when current zoom matches this mode’s computed fit scale within
   * epsilon. Turns off when the user zooms ± away.
   */
  isActive: boolean;
  /**
   * Re-apply the shown fit when inactive; advance width → height → page when
   * the shown fit is already active.
   */
  cycleFit: () => void;
}

function applyFitMode(
  mode: PdfFitMode,
  viewport: Pick<CyclingFitViewport, "fitWidth" | "fitHeight" | "fitPage">,
): void {
  switch (mode) {
    case "width":
      viewport.fitWidth();
      break;
    case "height":
      viewport.fitHeight();
      break;
    case "page":
      viewport.fitPage();
      break;
  }
}

export function useCyclingFitMode(
  viewport: CyclingFitViewport,
  options: UseCyclingFitModeOptions = {},
): UseCyclingFitModeReturn {
  const {
    initialMode = "width",
    activeEpsilon = PDF_FIT_SCALE_EPSILON,
    applyInitialFit = false,
  } = options;
  const [lastApplied, setLastApplied] = useState<PdfFitMode | null>(null);
  const { fitWidth, fitHeight, fitPage, canFit, scale, getFitScale } = viewport;
  const seededRef = useRef(false);

  const mode = lastApplied ?? initialMode;

  const targetScale = getFitScale(mode);
  const isActive =
    targetScale !== null && isFitScaleActive(scale, targetScale, activeEpsilon);

  const nextMode = resolveCyclingFitApplyMode(
    lastApplied,
    initialMode,
    isActive,
  );
  const descriptor = getPdfFitModeDescriptor(mode);
  const nextDescriptor = getPdfFitModeDescriptor(nextMode);

  // Apply the advertised default fit once layout can measure (container may
  // still be 0×0 on the first paint after pageSize arrives).
  useLayoutEffect(() => {
    if (!applyInitialFit || seededRef.current || !canFit) return;

    let cancelled = false;
    let frames = 0;
    const MAX_FRAMES = 60;

    const trySeed = (): boolean => {
      if (cancelled || seededRef.current) return true;
      if (getFitScale(initialMode) === null) return false;
      applyFitMode(initialMode, { fitWidth, fitHeight, fitPage });
      setLastApplied(initialMode);
      seededRef.current = true;
      return true;
    };

    if (trySeed()) return;

    let raf = 0;
    const tick = (): void => {
      if (trySeed() || frames++ >= MAX_FRAMES) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [
    applyInitialFit,
    canFit,
    initialMode,
    getFitScale,
    fitWidth,
    fitHeight,
    fitPage,
  ]);

  const cycleFit = useCallback(() => {
    const toApply = resolveCyclingFitApplyMode(
      lastApplied,
      initialMode,
      isActive,
    );
    applyFitMode(toApply, { fitWidth, fitHeight, fitPage });
    setLastApplied(toApply);
    seededRef.current = true;
  }, [lastApplied, initialMode, isActive, fitWidth, fitHeight, fitPage]);

  return {
    mode,
    nextMode,
    descriptor,
    nextDescriptor,
    canFit,
    isActive,
    cycleFit,
  };
}

/** Convenience title from a {@link UseCyclingFitModeReturn}. */
export function fitCycleTitleFromReturn(
  fit: Pick<UseCyclingFitModeReturn, "descriptor" | "nextDescriptor">,
): string {
  return getPdfFitCycleTitle(fit.descriptor, fit.nextDescriptor);
}
