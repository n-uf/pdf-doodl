/**
 * Type exports for Doodl
 */

// Geometry
export type { Bounds, Point, Size } from "./geometry";

// Bounds Policy
export { calculateConstrainDelta, calculateOverflow } from "./bounds-policy";
export type {
  BoundsEnforcementResult,
  BoundsOverflow,
  BoundsPolicy,
  CanvasBounds,
} from "./bounds-policy";

// Style
export {
  ANNOTATION_STYLE,
  DEFAULT_SHAPE_STYLE,
  HIGHLIGHT_STYLE,
  REDACT_HIGHLIGHT_STYLE,
  REDACT_ZONE_STYLE,
} from "./style";
export type { BlendMode, ShapeStyle } from "./style";

// Behavior
export {
  DEFAULT_BEHAVIOR,
  DEFAULT_BEHAVIOR_PRESET,
  SHAPE_BEHAVIORS,
  extendBehavior,
  getStyleMode,
  getZOrder,
  isDeletable,
  isEditable,
  isPersisted,
  isSelectable,
  isTracked,
  resolveBehavior,
} from "./behavior";
export type {
  ShapeBehavior,
  ShapeBehaviorPreset,
  ShapeBehaviorValue,
  ShapeStyleMode,
} from "./behavior";

// Input
export { DEFAULT_MODIFIERS } from "./input";
export type { DrawModifiers } from "./input";

// Tools (client-facing config)
export { TOOL_CONFIGS, getToolConfig } from "../tools";
export type { DrawTool, ToolConfig } from "../tools";

// Shapes (types, factories, utilities)
export type {
  DrawShape,
  EllipseShape,
  FreehandShape,
  PolygonShape,
  RectShape,
} from "../shapes";

export {
  createEllipseShape,
  createFreehandShape,
  createPolygonShape,
  createRectShape,
  generateShapeId,
  getEllipseBounds,
  getFreehandBounds,
  getPolygonBounds,
  getRectBounds,
  getShapeBounds,
} from "../shapes";

// State
export type {
  ActiveDrawingState,
  BatchShapeUpdate,
  DoodlRuntimeState,
  DrawingMetadata,
  DrawingState,
  SelectionState,
  ShapeUpdate,
} from "./state";

export {
  DRAWING_STATE_VERSION,
  createEmptySelection,
  createEmptyState,
  createIdleDrawingState,
} from "./state";

// Performance
export {
  createPerformanceConfig,
  DEFAULT_PERFORMANCE_CONFIG,
  DEFAULT_RENDERING_CONFIG,
} from "./performance";
export type {
  DoodlPerformanceConfig,
  ImageSmoothingMode,
  RenderingQualityConfig,
  ResolvedDoodlPerformanceConfig,
} from "./performance";
