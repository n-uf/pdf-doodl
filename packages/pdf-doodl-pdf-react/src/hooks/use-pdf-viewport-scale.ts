"use client";

/**
 * usePdfViewportScale - Reusable zoom/fit scale management for PDF viewers
 *
 * Extracted from pdf-doodl-go's DoodleGo composer so any consumer (a themed
 * studio shell, a compact console toolbar, etc.) can drive PDF page `scale`
 * without re-implementing zoom step math or fit-width/fit-height/fit-page
 * viewport measurement.
 *
 * Fit calculations need two things:
 * - `pageSize`: the PDF page's native (scale=1) dimensions, in points.
 * - Available viewport space: either measured from `containerRef` (an
 *   element wrapping the scrollable PDF viewport) or, when no ref is given,
 *   `window.innerWidth` / `window.innerHeight` minus `padding` (matches the
 *   original DoodleGo behavior of approximating chrome around the canvas).
 */

import { useCallback, useState } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface PdfPageSize {
  width: number;
  height: number;
}

export interface UsePdfViewportScaleOptions {
  /** Initial scale (default: 1) */
  initialScale?: number;
  /** Minimum allowed scale (default: 0.5) */
  minScale?: number;
  /** Maximum allowed scale (default: 3) */
  maxScale?: number;
  /** Zoom in/out step (default: 0.25) */
  step?: number;
  /**
   * Native (scale=1) page dimensions, used by `fitWidth` / `fitHeight` /
   * `fitPage`. When null/undefined, fit methods are no-ops.
   */
  pageSize?: PdfPageSize | null;
  /**
   * Ref to the element whose visible size approximates the PDF viewport.
   * When omitted, fit methods fall back to `window.innerWidth`/`innerHeight`.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Space (in CSS px) to subtract from the measured viewport before fitting,
   * e.g. for surrounding chrome/padding not part of the measured container.
   */
  padding?: { width?: number; height?: number };
}

export interface UsePdfViewportScaleReturn {
  /** Current scale factor */
  scale: number;
  /** Set scale directly (clamped to [minScale, maxScale]) */
  setScale: (scale: number) => void;
  /** Increase scale by `step` (clamped) */
  zoomIn: () => void;
  /** Decrease scale by `step` (clamped) */
  zoomOut: () => void;
  /** Reset scale to 1 (clamped) */
  resetZoom: () => void;
  /** Fit page width to the available viewport width */
  fitWidth: () => void;
  /** Fit page height to the available viewport height */
  fitHeight: () => void;
  /** Fit the entire page (width AND height) inside the available viewport */
  fitPage: () => void;
  /** Whether `pageSize` is known (fit methods are no-ops otherwise) */
  canFit: boolean;
  /** `scale >= maxScale` */
  atMaxZoom: boolean;
  /** `scale <= minScale` */
  atMinZoom: boolean;
}

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_MIN_SCALE = 0.5;
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_STEP = 0.25;

// =============================================================================
// HOOK
// =============================================================================

export function usePdfViewportScale(
  options: UsePdfViewportScaleOptions = {}
): UsePdfViewportScaleReturn {
  const {
    initialScale = 1,
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE,
    step = DEFAULT_STEP,
    pageSize = null,
    containerRef,
    padding,
  } = options;

  const clamp = useCallback(
    (value: number) => Math.max(minScale, Math.min(value, maxScale)),
    [minScale, maxScale]
  );

  const [scale, setScaleState] = useState(() => clamp(initialScale));

  const setScale = useCallback(
    (value: number) => {
      setScaleState(clamp(value));
    },
    [clamp]
  );

  const zoomIn = useCallback(() => {
    setScaleState((prev) => clamp(prev + step));
  }, [clamp, step]);

  const zoomOut = useCallback(() => {
    setScaleState((prev) => clamp(prev - step));
  }, [clamp, step]);

  const resetZoom = useCallback(() => {
    setScaleState(clamp(1));
  }, [clamp]);

  /** Available viewport size: measured container, else window, minus padding. */
  const measureAvailableSize = useCallback((): PdfPageSize | null => {
    const paddingWidth = padding?.width ?? 0;
    const paddingHeight = padding?.height ?? 0;

    const container = containerRef?.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      return {
        width: rect.width - paddingWidth,
        height: rect.height - paddingHeight,
      };
    }

    if (typeof window === "undefined") return null;
    return {
      width: window.innerWidth - paddingWidth,
      height: window.innerHeight - paddingHeight,
    };
  }, [containerRef, padding?.width, padding?.height]);

  const fitWidth = useCallback(() => {
    if (!pageSize) return;
    const available = measureAvailableSize();
    if (!available || available.width <= 0) return;
    setScaleState(clamp(available.width / pageSize.width));
  }, [pageSize, measureAvailableSize, clamp]);

  const fitHeight = useCallback(() => {
    if (!pageSize) return;
    const available = measureAvailableSize();
    if (!available || available.height <= 0) return;
    setScaleState(clamp(available.height / pageSize.height));
  }, [pageSize, measureAvailableSize, clamp]);

  const fitPage = useCallback(() => {
    if (!pageSize) return;
    const available = measureAvailableSize();
    if (!available || available.width <= 0 || available.height <= 0) return;
    const scaleX = available.width / pageSize.width;
    const scaleY = available.height / pageSize.height;
    setScaleState(clamp(Math.min(scaleX, scaleY)));
  }, [pageSize, measureAvailableSize, clamp]);

  return {
    scale,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
    fitWidth,
    fitHeight,
    fitPage,
    canFit: pageSize !== null,
    atMaxZoom: scale >= maxScale,
    atMinZoom: scale <= minScale,
  };
}
