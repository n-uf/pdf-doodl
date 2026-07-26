/**
 * Rectangle renderer
 */

import type { RectShape } from "../../types";
import { mapBlendMode } from "../common/utils/canvas";

/**
 * Render a rectangle
 */
export function renderRect(
  ctx: CanvasRenderingContext2D,
  rect: RectShape
): void {
  ctx.save();

  // Handle rotation
  if (rect.rotation) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((rect.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // Fill
  if (rect.style.fill && rect.style.fill !== "none") {
    ctx.fillStyle = rect.style.fill;
    ctx.globalAlpha = rect.style.fillOpacity ?? 1;
    if (rect.style.blendMode) {
      ctx.globalCompositeOperation = mapBlendMode(rect.style.blendMode);
    }
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  // Stroke
  if (rect.style.stroke && rect.style.stroke !== "none") {
    ctx.strokeStyle = rect.style.stroke;
    ctx.lineWidth = rect.style.strokeWidth ?? 2;
    ctx.globalAlpha = rect.style.strokeOpacity ?? 1;
    if (rect.style.strokeDash) {
      ctx.setLineDash(rect.style.strokeDash);
    }
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  ctx.restore();
}
