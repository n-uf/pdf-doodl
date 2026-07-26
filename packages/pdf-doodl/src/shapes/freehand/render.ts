/**
 * Freehand path renderer
 */

import type { FreehandShape } from "../../types";
import { mapBlendMode } from "../common/utils/canvas";

/**
 * Render a freehand path
 */
export function renderFreehand(
  ctx: CanvasRenderingContext2D,
  freehand: FreehandShape
): void {
  if (freehand.points.length < 2) return;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(freehand.points[0]!.x, freehand.points[0]!.y);

  // Use quadratic curves for smooth path
  for (let i = 1; i < freehand.points.length - 1; i++) {
    const p1 = freehand.points[i]!;
    const p2 = freehand.points[i + 1]!;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
  }

  // Draw to the last point
  const lastPoint = freehand.points[freehand.points.length - 1]!;
  ctx.lineTo(lastPoint.x, lastPoint.y);

  if (freehand.closed) {
    ctx.closePath();
  }

  // Fill (only if closed)
  if (
    freehand.closed &&
    freehand.style.fill &&
    freehand.style.fill !== "none"
  ) {
    ctx.fillStyle = freehand.style.fill;
    ctx.globalAlpha = freehand.style.fillOpacity ?? 1;
    if (freehand.style.blendMode) {
      ctx.globalCompositeOperation = mapBlendMode(freehand.style.blendMode);
    }
    ctx.fill();
  }

  // Stroke
  if (freehand.style.stroke && freehand.style.stroke !== "none") {
    ctx.strokeStyle = freehand.style.stroke;
    ctx.lineWidth = freehand.style.strokeWidth ?? 2;
    ctx.globalAlpha = freehand.style.strokeOpacity ?? 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (freehand.style.strokeDash) {
      ctx.setLineDash(freehand.style.strokeDash);
    }
    ctx.stroke();
  }

  ctx.restore();
}
