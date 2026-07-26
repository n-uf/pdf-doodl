/**
 * Freehand shape module
 */

export {
  FreehandController,
  createFreehandController,
  createHighlightController,
} from "./controller";
export { hitTestFreehandFill, hitTestFreehandStroke } from "./hit-test";
export { FREEHAND_MODULE } from "./module";
export { getFreehandPosition, transformFreehand } from "./transform";
export { renderFreehand } from "./render";
export {
  DEFAULT_EPSILON,
  getPathLength,
  resamplePath,
  simplifyPath,
  simplifyPathWithMinPoints,
  smoothPath,
} from "./simplification";
export { createFreehandShape, getFreehandBounds } from "./types";
export type { FreehandShape } from "./types";
export { isValidFreehand } from "./validate";
