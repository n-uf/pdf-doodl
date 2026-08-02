/**
 * Role-tagged occurrence highlight painting.
 *
 * Callers paint a set of occurrence boxes in one call with per-box visual
 * roles. The library exposes role *slots* only — concrete colors come from
 * the caller (e.g. a product annotation palette). Defaults below are
 * palette-agnostic placeholders for tests / demos, not a product theme.
 */

import type { Bounds } from "../../../types/geometry";
import type { ShapeStyle } from "../../../types/style";
import type { DrawShape } from "../registry";
import type { RectShape } from "../../rect/types";
import {
  resolveBlockSubrangeHighlight,
  type ResolveBlockSubrangeHighlightOptions,
  type BlockSubrangeHighlightResult,
} from "./block-subrange-highlight";

// =============================================================================
// PUBLIC TYPES
// =============================================================================

/**
 * Visual role for an occurrence box in a multi-occurrence paint call.
 *
 * - `selected` — primary focus (caller usually also adds selection chrome)
 * - `sibling` — same-entity peer, softer / distinct from selected
 * - `plain-detect` — idle detection wash (no focus)
 */
export type OccurrenceHighlightRole =
  | "selected"
  | "sibling"
  | "plain-detect";

/** Caller-supplied style slots keyed by {@link OccurrenceHighlightRole}. */
export type OccurrenceHighlightRoleStyles = Record<
  OccurrenceHighlightRole,
  ShapeStyle
>;

/** One occurrence box tagged with a paint role. */
export interface RoleTaggedOccurrenceBox {
  role: OccurrenceHighlightRole;
  bounds: Bounds;
  /** Stable shape id; defaults to `{idPrefix}:{role}:{index}`. */
  id?: string;
}

export interface ShapesForOccurrenceHighlightRolesOptions {
  /** Shape id prefix when a box omits `id` (default `"occ-role"`). */
  idPrefix?: string;
  /**
   * When true (default), shapes are non-interactive overlay chrome.
   * Set false when the caller wants hit-testable boxes.
   */
  chromeOnly?: boolean;
  /** Base z-order (default 90). */
  zOrder?: number;
}

/** One sub-block occurrence (or fallback box) tagged with a paint role. */
export interface RoleTaggedOccurrenceResolveItem {
  role: OccurrenceHighlightRole;
  resolve: Omit<ResolveBlockSubrangeHighlightOptions, "style">;
  /** Optional id prefix for this item's shapes (default uses shared prefix + role). */
  idPrefix?: string;
}

export interface ResolveOccurrenceHighlightsWithRolesOptions {
  items: readonly RoleTaggedOccurrenceResolveItem[];
  styles: OccurrenceHighlightRoleStyles;
  /** Shared id prefix (default `"occ-role"`). */
  idPrefix?: string;
}

export interface ResolveOccurrenceHighlightsWithRolesResult {
  shapes: DrawShape[];
  results: BlockSubrangeHighlightResult[];
}

// =============================================================================
// DEFAULT STYLE SLOTS (palette-agnostic placeholders)
// =============================================================================

/**
 * Distinct placeholder styles for the three roles — for tests/demos only.
 * Products should pass their own theme-derived {@link OccurrenceHighlightRoleStyles}.
 */
export const DEFAULT_OCCURRENCE_HIGHLIGHT_ROLE_STYLES: OccurrenceHighlightRoleStyles =
  {
    selected: {
      fill: "#2979FF",
      fillOpacity: 0.28,
      stroke: "#2979FF",
      strokeWidth: 2,
      strokeOpacity: 0.95,
      cornerRadius: 2,
      screenSpaceStroke: true,
    },
    sibling: {
      fill: "#F59E0B",
      fillOpacity: 0.22,
      stroke: "#D97706",
      strokeWidth: 1.5,
      strokeOpacity: 0.85,
      cornerRadius: 2,
      screenSpaceStroke: true,
    },
    "plain-detect": {
      fill: "#06B6D4",
      fillOpacity: 0.12,
      stroke: "#0891B2",
      strokeWidth: 1,
      strokeOpacity: 0.55,
      cornerRadius: 2,
      screenSpaceStroke: true,
    },
  };

const ROLE_CHROME_BEHAVIOR = {
  persisted: false,
  selectable: false,
  editable: false,
  tracked: false,
  deletable: false,
  zOrder: 90,
  styleMode: "normal" as const,
} as const;

const ROLE_HIT_BEHAVIOR = {
  persisted: false,
  selectable: true,
  editable: false,
  tracked: false,
  deletable: false,
  zOrder: 80,
  styleMode: "normal" as const,
} as const;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Pick the style slot for a role (shallow copy so callers can mutate safely).
 */
export function styleForOccurrenceHighlightRole(
  role: OccurrenceHighlightRole,
  styles: OccurrenceHighlightRoleStyles,
): ShapeStyle {
  return { ...styles[role] };
}

/**
 * Paint a set of occurrence boxes with per-box roles in one call.
 * Palette-agnostic: styles are entirely caller-supplied.
 */
export function shapesForOccurrenceHighlightRoles(
  boxes: readonly RoleTaggedOccurrenceBox[],
  styles: OccurrenceHighlightRoleStyles,
  options: ShapesForOccurrenceHighlightRolesOptions = {},
): DrawShape[] {
  const idPrefix = options.idPrefix ?? "occ-role";
  const chromeOnly = options.chromeOnly ?? true;
  const zOrder = options.zOrder ?? (chromeOnly ? 90 : 80);
  const behavior = {
    ...(chromeOnly ? ROLE_CHROME_BEHAVIOR : ROLE_HIT_BEHAVIOR),
    zOrder,
  };

  return boxes.map((box, index) => {
    const style = styleForOccurrenceHighlightRole(box.role, styles);
    const id = box.id ?? `${idPrefix}:${box.role}:${index}`;
    const shape: RectShape = {
      id,
      type: "rect",
      x: box.bounds.x,
      y: box.bounds.y,
      width: box.bounds.width,
      height: box.bounds.height,
      style,
      behavior,
    };
    return shape;
  });
}

/**
 * Resolve a batch of sub-block occurrence specs, each tagged with a paint
 * role, and return role-styled shapes in one call.
 *
 * Geometry comes from {@link resolveBlockSubrangeHighlight}; style comes from
 * the caller-supplied role slots (never from hard-coded product colors).
 */
export function resolveOccurrenceHighlightsWithRoles(
  options: ResolveOccurrenceHighlightsWithRolesOptions,
): ResolveOccurrenceHighlightsWithRolesResult {
  const sharedPrefix = options.idPrefix ?? "occ-role";
  const results: BlockSubrangeHighlightResult[] = [];
  const roleBoxes: RoleTaggedOccurrenceBox[] = [];

  options.items.forEach((item, itemIndex) => {
    const itemPrefix =
      item.idPrefix ?? `${sharedPrefix}:${item.role}:${itemIndex}`;
    const resolved = resolveBlockSubrangeHighlight({
      ...item.resolve,
      style: styleForOccurrenceHighlightRole(item.role, options.styles),
      idPrefix: itemPrefix,
    });
    results.push(resolved);
    resolved.bounds.forEach((bounds, boundIndex) => {
      roleBoxes.push({
        role: item.role,
        bounds,
        id: `${itemPrefix}:${boundIndex}`,
      });
    });
  });

  // Re-paint from role boxes so a single behavior/z-order policy applies even
  // when resolveBlockSubrangeHighlight attached its own default behavior.
  const shapes = shapesForOccurrenceHighlightRoles(
    roleBoxes,
    options.styles,
    { idPrefix: sharedPrefix, chromeOnly: true },
  );

  return { shapes, results };
}
