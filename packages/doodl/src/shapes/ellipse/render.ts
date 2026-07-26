/**
 * Ellipse renderer
 */

import type { EllipseShape } from "../../types";
import { mapBlendMode } from "../common/utils/canvas";

/**
 * Render an ellipse
 */
export function renderEllipse(
  ctx: CanvasRenderingContext2D,
  ellipse: EllipseShape
): void {
  ctx.save();

  // Handle rotation
  if (ellipse.rotation) {
    ctx.translate(ellipse.cx, ellipse.cy);
    ctx.rotate((ellipse.rotation * Math.PI) / 180);
    ctx.translate(-ellipse.cx, -ellipse.cy);
  }

  ctx.beginPath();
  ctx.ellipse(
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    0,
    0,
    Math.PI * 2
  );

  // Fill
  if (ellipse.style.fill && ellipse.style.fill !== "none") {
    ctx.fillStyle = ellipse.style.fill;
    ctx.globalAlpha = ellipse.style.fillOpacity ?? 1;
    if (ellipse.style.blendMode) {
      ctx.globalCompositeOperation = mapBlendMode(ellipse.style.blendMode);
    }
    ctx.fill();
  }

  // Stroke
  if (ellipse.style.stroke && ellipse.style.stroke !== "none") {
    ctx.strokeStyle = ellipse.style.stroke;
    ctx.lineWidth = ellipse.style.strokeWidth ?? 2;
    ctx.globalAlpha = ellipse.style.strokeOpacity ?? 1;
    if (ellipse.style.strokeDash) {
      ctx.setLineDash(ellipse.style.strokeDash);
    }
    ctx.stroke();
  }

  ctx.restore();
}
