"use client";

/**
 * Cycles fit-width → fit-height → fit-page through a single control.
 *
 * The button shows the mode that the next click will apply; on click it
 * applies that fit and advances the label to the following mode.
 */

import { useCallback, useState, type CSSProperties } from "react";
import type { UsePdfViewportScaleReturn } from "./use-pdf-viewport-scale";

export type PdfFitMode = "width" | "height" | "page";

export interface PdfFitModeDescriptor {
  mode: PdfFitMode;
  icon: string;
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
    icon: "↔",
    label: "Width",
    title: "Fit width",
  },
  height: {
    mode: "height",
    icon: "↕",
    label: "Height",
    title: "Fit height",
  },
  page: {
    mode: "page",
    icon: "⬚",
    label: "Page",
    title: "Fit page",
  },
};

export function getPdfFitModeDescriptor(mode: PdfFitMode): PdfFitModeDescriptor {
  return FIT_MODE_DESCRIPTORS[mode];
}

/**
 * Fixed width on the fit-cycle button (scales with button font-size via `ch`).
 * Sized for longest icon+label ("↕ Height") plus typical `px-2` padding under
 * border-box — keep width on the outer control, not only the inner label.
 *
 * Prefer {@link PDF_FIT_CYCLE_BUTTON_STYLE} when the host may purge Tailwind.
 */
export const PDF_FIT_CYCLE_BUTTON_CLASS =
  "inline-flex w-[12ch] shrink-0 items-center justify-center whitespace-nowrap";

/** Inner row; outer {@link PDF_FIT_CYCLE_BUTTON_CLASS} holds stable width. */
export const PDF_FIT_CYCLE_LABEL_CLASS =
  "inline-flex items-center justify-center gap-0.5";

/**
 * Identical fixed square for zoom − / + so glyph width cannot skew the strip.
 * Pair with a chrome class; prefer `p-0` (or override padding) on the host.
 */
export const PDF_ZOOM_STEP_BUTTON_CLASS =
  "inline-flex size-6 shrink-0 items-center justify-center p-0";

/**
 * Fixed width for zoom percent — sized for max label `"300%"` with padding.
 * Also set {@link PDF_ZOOM_PERCENT_BUTTON_STYLE} so purge cannot drop the lock.
 */
export const PDF_ZOOM_PERCENT_BUTTON_CLASS =
  "inline-flex w-[7ch] shrink-0 items-center justify-center whitespace-nowrap text-center font-mono tabular-nums";

/** Longest zoom percent label this control is sized for (max scale 300%). */
export const PDF_ZOOM_PERCENT_MAX_LABEL = "300%";

/**
 * Purge-proof layout for the zoom percent control. Apply via `style={…}` —
 * does not depend on Tailwind scanning imported class-string constants.
 * Uses tabular + monospace so ##% and ###% share digit advance width.
 */
export const PDF_ZOOM_PERCENT_BUTTON_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: "7ch",
  minWidth: "7ch",
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

/** Purge-proof equal squares for zoom − / +. */
export const PDF_ZOOM_STEP_BUTTON_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: 24,
  height: 24,
  minWidth: 24,
  padding: 0,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Purge-proof fixed width for the fit-cycle control. */
export const PDF_FIT_CYCLE_BUTTON_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: "12ch",
  minWidth: "12ch",
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

export type CyclingFitViewport = Pick<
  UsePdfViewportScaleReturn,
  "fitWidth" | "fitHeight" | "fitPage" | "canFit"
>;

export interface UseCyclingFitModeOptions {
  /** Mode shown (and applied) on the first click. Default: `"width"`. */
  initialMode?: PdfFitMode;
}

export interface UseCyclingFitModeReturn {
  /** Mode that the next click will apply. */
  mode: PdfFitMode;
  descriptor: PdfFitModeDescriptor;
  canFit: boolean;
  /** Apply the currently displayed fit mode, then advance to the next. */
  cycleFit: () => void;
}

export function useCyclingFitMode(
  viewport: CyclingFitViewport,
  options: UseCyclingFitModeOptions = {},
): UseCyclingFitModeReturn {
  const { initialMode = "width" } = options;
  const [mode, setMode] = useState<PdfFitMode>(initialMode);
  const { fitWidth, fitHeight, fitPage, canFit } = viewport;

  const descriptor = getPdfFitModeDescriptor(mode);

  const cycleFit = useCallback(() => {
    switch (mode) {
      case "width":
        fitWidth();
        break;
      case "height":
        fitHeight();
        break;
      case "page":
        fitPage();
        break;
    }
    setMode(nextPdfFitMode(mode));
  }, [mode, fitWidth, fitHeight, fitPage]);

  return { mode, descriptor, canFit, cycleFit };
}
