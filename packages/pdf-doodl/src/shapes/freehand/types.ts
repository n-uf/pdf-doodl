/**
 * Freehand type definitions
 */

import type { Bounds, Point } from "../../types/geometry";
import type { ShapeStyle } from "../../types/style";
import { DEFAULT_SHAPE_STYLE } from "../../types/style";
import type { DrawShape } from "../common/registry";
import { generateShapeId } from "../common/registry";

/**
 * Freehand shape
 * Smooth path with optional closure
 */
export interface FreehandShape extends DrawShape {
  type: "freehand";
  /** Path points (may be simplified) */
  points: Point[];
  /** Whether the path is closed */
  closed: boolean;
}

/**
 * Create a freehand shape
 */
export function createFreehandShape(
  points: Point[],
  closed: boolean = false,
  style: ShapeStyle = DEFAULT_SHAPE_STYLE
): FreehandShape {
  return {
    id: generateShapeId(),
    type: "freehand",
    points: [...points],
    closed,
    style,
  };
}

/**
 * Get bounding box of a freehand path
 */
export function getFreehandBounds(freehand: FreehandShape): Bounds {
  if (freehand.points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const xs = freehand.points.map((p) => p.x);
  const ys = freehand.points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
