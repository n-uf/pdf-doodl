/**
 * Shape style type definitions
 */

/**
 * Canvas blend modes
 */
export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten";

/**
 * Shape styling options
 */
export interface ShapeStyle {
  /** Fill color (CSS color string) or "none" */
  fill?: string;
  /** Fill opacity (0-1), default 1 */
  fillOpacity?: number;
  /** Stroke color (CSS color string) or "none" */
  stroke?: string;
  /** Stroke width in pixels, default 2 */
  strokeWidth?: number;
  /** Stroke opacity (0-1), default 1 */
  strokeOpacity?: number;
  /** Dash pattern [on, off] */
  strokeDash?: number[];
  /** Blend mode, default "normal" */
  blendMode?: BlendMode;
}

/**
 * Default shape style
 */
export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: "#3B82F6",
  fillOpacity: 0.3,
  stroke: "#3B82F6",
  strokeWidth: 2,
  strokeOpacity: 1,
  blendMode: "normal",
};

// =============================================================================
// STYLE PRESETS
// =============================================================================

/**
 * Highlight style preset (semi-transparent yellow)
 */
export const HIGHLIGHT_STYLE: ShapeStyle = {
  fill: "#FFEB3B",
  fillOpacity: 0.3,
  stroke: "none",
  strokeWidth: 0,
  blendMode: "multiply",
};

/**
 * Redaction zone style preset (solid black)
 */
export const REDACT_ZONE_STYLE: ShapeStyle = {
  fill: "#000000",
  fillOpacity: 1,
  stroke: "none",
  strokeWidth: 0,
  blendMode: "normal",
};

/**
 * Redaction highlight style preset (semi-transparent red)
 */
export const REDACT_HIGHLIGHT_STYLE: ShapeStyle = {
  fill: "#FF5722",
  fillOpacity: 0.3,
  stroke: "none",
  strokeWidth: 0,
  blendMode: "multiply",
};

/**
 * Default annotation style
 */
export const ANNOTATION_STYLE: ShapeStyle = {
  fill: "#3B82F6",
  fillOpacity: 0.2,
  stroke: "#3B82F6",
  strokeWidth: 2,
  strokeOpacity: 1,
  blendMode: "normal",
};
