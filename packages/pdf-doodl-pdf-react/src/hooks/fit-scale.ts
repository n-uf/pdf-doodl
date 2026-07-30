/**
 * Pure fit-scale math for PDF viewport zoom.
 *
 * All three modes return a **uniform** scale (same factor for x and y).
 * Never mix axes: fitWidth uses widths only; fitHeight uses heights only.
 */

export type FitScaleMode = "width" | "height" | "page";

/**
 * Absolute scale epsilon for “still at this fit” detection.
 * Large enough for float/clamp noise; far smaller than a zoom step (0.25).
 */
export const PDF_FIT_SCALE_EPSILON = 0.001;

export function computeFitWidthScale(
  availableWidth: number,
  pageWidth: number,
): number {
  return availableWidth / pageWidth;
}

export function computeFitHeightScale(
  availableHeight: number,
  pageHeight: number,
): number {
  return availableHeight / pageHeight;
}

export function computeFitPageScale(
  availableWidth: number,
  availableHeight: number,
  pageWidth: number,
  pageHeight: number,
): number {
  const scaleX = computeFitWidthScale(availableWidth, pageWidth);
  const scaleY = computeFitHeightScale(availableHeight, pageHeight);
  return Math.min(scaleX, scaleY);
}

/** Uniform scale for a named fit mode (no clamp). */
export function computeFitModeScale(
  mode: FitScaleMode,
  availableWidth: number,
  availableHeight: number,
  pageWidth: number,
  pageHeight: number,
): number {
  switch (mode) {
    case "width":
      return computeFitWidthScale(availableWidth, pageWidth);
    case "height":
      return computeFitHeightScale(availableHeight, pageHeight);
    case "page":
      return computeFitPageScale(
        availableWidth,
        availableHeight,
        pageWidth,
        pageHeight,
      );
  }
}

/** Inclusive `[min, max]` scale clamp for {@link resolveFitScale}. */
export interface FitScaleClampRange {
  min: number;
  max: number;
}

/** Measured available (content-box) viewport size, in CSS px. */
export interface FitAvailableSize {
  width: number;
  height: number;
}

/**
 * Clamped viewport scale for a fit policy given a measured container, or
 * `null` when the axis this policy needs is unmeasurable (≤ 0 — e.g. a
 * container that has not laid out yet, or a collapsed pane).
 *
 * Pure and side-effect free: the shared core of both `usePdfViewportScale`'s
 * one-shot fit methods AND its container-resize tracking, so a manual fit
 * click and an automatic recompute on {@link ResizeObserver} always land on
 * the exact same scale.
 */
export function resolveFitScale(
  mode: FitScaleMode,
  available: FitAvailableSize,
  page: FitAvailableSize,
  clampRange: FitScaleClampRange,
): number | null {
  if (mode === "width" && available.width <= 0) return null;
  if (mode === "height" && available.height <= 0) return null;
  if (mode === "page" && (available.width <= 0 || available.height <= 0)) {
    return null;
  }
  const raw = computeFitModeScale(
    mode,
    available.width,
    available.height,
    page.width,
    page.height,
  );
  return Math.max(clampRange.min, Math.min(raw, clampRange.max));
}

/** True when current zoom still matches a fit’s computed (clamped) scale. */
export function isFitScaleActive(
  currentScale: number,
  targetScale: number,
  epsilon: number = PDF_FIT_SCALE_EPSILON,
): boolean {
  return Math.abs(currentScale - targetScale) <= epsilon;
}
