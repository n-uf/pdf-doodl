/**
 * Pure fit-scale math for PDF viewport zoom.
 *
 * All three modes return a **uniform** scale (same factor for x and y).
 * Never mix axes: fitWidth uses widths only; fitHeight uses heights only.
 */

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
