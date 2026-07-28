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

/** True when current zoom still matches a fit’s computed (clamped) scale. */
export function isFitScaleActive(
  currentScale: number,
  targetScale: number,
  epsilon: number = PDF_FIT_SCALE_EPSILON,
): boolean {
  return Math.abs(currentScale - targetScale) <= epsilon;
}
