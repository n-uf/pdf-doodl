/**
 * Common validation utilities
 */

import type { Point } from "../../../types/geometry";
import type { ShapeStyle } from "../../../types/style";

/**
 * Validate a point object
 */
export function isValidPoint(obj: unknown): obj is Point {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Point).x === "number" &&
    typeof (obj as Point).y === "number" &&
    !isNaN((obj as Point).x) &&
    !isNaN((obj as Point).y)
  );
}

/**
 * Validate a shape style object
 */
export function isValidStyle(obj: unknown): obj is ShapeStyle {
  if (typeof obj !== "object" || obj === null) return false;
  const style = obj as ShapeStyle;

  if (style.fill !== undefined && typeof style.fill !== "string") return false;
  if (style.fillOpacity !== undefined && typeof style.fillOpacity !== "number")
    return false;
  if (style.stroke !== undefined && typeof style.stroke !== "string")
    return false;
  if (style.strokeWidth !== undefined && typeof style.strokeWidth !== "number")
    return false;
  if (
    style.strokeOpacity !== undefined &&
    typeof style.strokeOpacity !== "number"
  )
    return false;
  if (style.strokeDash !== undefined && !Array.isArray(style.strokeDash))
    return false;
  if (style.blendMode !== undefined && typeof style.blendMode !== "string")
    return false;

  return true;
}

/**
 * Validate base shape properties (id, type, style)
 */
export function hasValidDrawShape(obj: unknown, expectedType: string): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  const shape = obj as { id?: unknown; type?: unknown; style?: unknown };

  if (typeof shape.id !== "string" || shape.id.length === 0) return false;
  if (shape.type !== expectedType) return false;
  if (!isValidStyle(shape.style)) return false;

  return true;
}
