/**
 * Sub-block (occurrence / char-range) highlight shapes.
 *
 * Uses PDF.js text-layer span-proportional geometry via `findTextInTextLayer`
 * to draw emphasized rects around a single lexeme occurrence inside a block.
 * When text geometry is unavailable or the occurrence cannot be resolved,
 * falls back to the whole-block bounds — never throws.
 */

import type { Bounds } from "../../../types/geometry";
import type { ShapeStyle } from "../../../types/style";
import type { DrawShape } from "../registry";
import type { RectShape } from "../../rect/types";
import { boundsIntersect, getIntersectionArea } from "./text-intersection";
import { findTextInTextLayer, type TextMatch } from "./text-bounds-finder";
import {
  listOccurrenceCharRanges,
  normalizeOccurrenceLexeme,
  resolveOccurrenceCharRange,
  type CharRange,
} from "./occurrence-range";

// =============================================================================
// PUBLIC TYPES
// =============================================================================

/**
 * Occurrence highlight spec — nth non-overlapping normalized lexeme hit
 * inside the block (see `resolveOccurrenceCharRange`).
 */
export interface BlockOccurrenceHighlightSpec {
  kind: "occurrence";
  blockId: string | number;
  lexeme: string;
  /** 1-based ordinal within the block. */
  ordinal: number;
}

/**
 * Low-level char-range highlight spec — indices into the block's reading-order
 * text (same text `resolveOccurrenceCharRange` would search).
 */
export interface BlockCharRangeHighlightSpec {
  kind: "char-range";
  blockId: string | number;
  /** Inclusive start in block text. */
  start: number;
  /** Exclusive end in block text. */
  end: number;
}

export type BlockSubrangeHighlightSpec =
  | BlockOccurrenceHighlightSpec
  | BlockCharRangeHighlightSpec;

export interface ResolveBlockSubrangeHighlightOptions {
  spec: BlockSubrangeHighlightSpec;
  /** Block geometry in doodl page space (top-left origin, Y-down). */
  blockBounds: Bounds;
  /**
   * Whole-block fallback bounds (typically the same as `blockBounds`).
   * Used when the text layer is missing or the occurrence cannot be resolved.
   */
  fallbackBounds: Bounds;
  /** PDF.js / react-pdf text layer element for the page, or null. */
  textLayer: HTMLElement | null;
  /** Render scale matching the text layer (page CSS px / PDF point). */
  scale: number;
  /** Override highlight style (defaults to {@link SUBRANGE_HIGHLIGHT_STYLE}). */
  style?: ShapeStyle;
  /** Shape id prefix (default `"subrange"`). */
  idPrefix?: string;
  /**
   * Optional pre-extracted block text for char-range / ordinal verification.
   * When omitted, geometry is resolved via page text-layer search clipped to
   * `blockBounds` (sufficient for occurrence specs).
   */
  blockText?: string;
}

export interface BlockSubrangeHighlightResult {
  shapes: DrawShape[];
  /** `subrange` when text geometry resolved; `fallback` for whole-block. */
  mode: "subrange" | "fallback";
  /** Resolved char range when known (block-local when `blockText` provided). */
  charRange: CharRange | null;
  /** Page-space bounds used for the shapes. */
  bounds: Bounds[];
  blockId: string | number;
}

// =============================================================================
// STYLE
// =============================================================================

/**
 * Sub-block emphasis — cool cyan fill + stroke so it reads apart from
 * block-level annotation boxes and amber find-match highlights.
 */
export const SUBRANGE_HIGHLIGHT_STYLE: ShapeStyle = {
  fill: "#22D3EE",
  fillOpacity: 0.45,
  stroke: "#0891B2",
  strokeWidth: 1.5,
  strokeOpacity: 0.95,
  blendMode: "multiply",
  cornerRadius: 1,
  screenSpaceStroke: true,
};

const SUBRANGE_BEHAVIOR = {
  persisted: false,
  selectable: false,
  editable: false,
  tracked: false,
  deletable: false,
  zOrder: 90,
  styleMode: "normal" as const,
};

// =============================================================================
// INTERNALS
// =============================================================================

function centerInside(inner: Bounds, outer: Bounds, pad = 1): boolean {
  const cx = inner.x + inner.width / 2;
  const cy = inner.y + inner.height / 2;
  return (
    cx >= outer.x - pad &&
    cx <= outer.x + outer.width + pad &&
    cy >= outer.y - pad &&
    cy <= outer.y + outer.height + pad
  );
}

function overlapRatio(a: Bounds, b: Bounds): number {
  const area = getIntersectionArea(a, b);
  const self = a.width * a.height;
  return self > 0 ? area / self : 0;
}

function matchInBlock(match: TextMatch, blockBounds: Bounds): boolean {
  return match.bounds.some(
    (bound) =>
      centerInside(bound, blockBounds) ||
      (boundsIntersect(bound, blockBounds) &&
        overlapRatio(bound, blockBounds) >= 0.4),
  );
}

function compareMatchOrder(a: TextMatch, b: TextMatch): number {
  if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
  return a.endIndex - b.endIndex;
}

/** Keep non-overlapping matches in reading order (by text-layer index). */
function takeNonOverlapping(matches: TextMatch[]): TextMatch[] {
  const sorted = [...matches].sort(compareMatchOrder);
  const kept: TextMatch[] = [];
  let lastEnd = -1;
  for (const match of sorted) {
    if (match.startIndex >= lastEnd) {
      kept.push(match);
      lastEnd = match.endIndex;
    }
  }
  return kept;
}

function boundsToShapes(
  bounds: Bounds[],
  style: ShapeStyle,
  idPrefix: string,
  blockId: string | number,
): RectShape[] {
  return bounds.map((bound, index) => ({
    id: `${idPrefix}:${String(blockId)}:${index}`,
    type: "rect" as const,
    x: bound.x,
    y: bound.y,
    width: bound.width,
    height: bound.height,
    style: { ...style },
    behavior: SUBRANGE_BEHAVIOR,
  }));
}

function fallbackResult(
  options: ResolveBlockSubrangeHighlightOptions,
  charRange: CharRange | null,
): BlockSubrangeHighlightResult {
  const style = options.style ?? SUBRANGE_HIGHLIGHT_STYLE;
  const idPrefix = options.idPrefix ?? "subrange";
  const bounds = [options.fallbackBounds];
  return {
    shapes: boundsToShapes(bounds, style, idPrefix, options.spec.blockId),
    mode: "fallback",
    charRange,
    bounds,
    blockId: options.spec.blockId,
  };
}

function resolveOccurrenceFromTextLayer(
  options: ResolveBlockSubrangeHighlightOptions,
  lexeme: string,
  ordinal: number,
): BlockSubrangeHighlightResult | null {
  const { textLayer, scale, blockBounds } = options;
  if (textLayer === null || scale === 0) return null;

  const matches = findTextInTextLayer(lexeme, textLayer, {
    scale,
    ignoreCase: true,
    maxMatches: 200,
    mergeRects: true,
    matchMode: "substring",
  });
  const inBlock = takeNonOverlapping(
    matches.filter((match) => matchInBlock(match, blockBounds)),
  );
  const hit = inBlock[ordinal - 1];
  if (hit === undefined || hit.bounds.length === 0) return null;

  let charRange: CharRange | null = {
    start: hit.startIndex,
    end: hit.endIndex,
  };
  // Prefer block-local range when block text is available.
  if (typeof options.blockText === "string") {
    charRange = resolveOccurrenceCharRange(
      options.blockText,
      lexeme,
      ordinal,
    );
  }

  const style = options.style ?? SUBRANGE_HIGHLIGHT_STYLE;
  const idPrefix = options.idPrefix ?? "subrange";
  return {
    shapes: boundsToShapes(hit.bounds, style, idPrefix, options.spec.blockId),
    mode: "subrange",
    charRange,
    bounds: hit.bounds,
    blockId: options.spec.blockId,
  };
}

function resolveCharRangeFromTextLayer(
  options: ResolveBlockSubrangeHighlightOptions,
  start: number,
  end: number,
): BlockSubrangeHighlightResult | null {
  const blockText = options.blockText;
  if (typeof blockText !== "string") {
    // Without block text we cannot interpret block-local indices safely.
    return null;
  }
  if (start < 0 || end > blockText.length || end <= start) return null;

  const slice = blockText.slice(start, end);
  if (slice.length === 0) return null;

  // Ordinal among non-overlapping exact slices before `start`, then geometry
  // via the occurrence path (normalized lexeme match).
  const needle = normalizeOccurrenceLexeme(slice);
  if (needle.length === 0) return null;

  const ranges = listOccurrenceCharRanges(blockText, slice);
  const ordinal =
    ranges.findIndex((range) => range.start === start && range.end === end) + 1;
  if (ordinal < 1) {
    // Fallback: count by raw slice position among non-overlapping raw finds.
    let rawOrdinal = 0;
    let searchFrom = 0;
    const upper = blockText.toUpperCase();
    const upperSlice = slice.toUpperCase();
    while (searchFrom <= start) {
      const idx = upper.indexOf(upperSlice, searchFrom);
      if (idx === -1 || idx > start) break;
      rawOrdinal += 1;
      if (idx === start) {
        return resolveOccurrenceFromTextLayer(options, slice, rawOrdinal);
      }
      searchFrom = idx + upperSlice.length;
    }
    return null;
  }

  return resolveOccurrenceFromTextLayer(options, slice, ordinal);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Resolve shapes for a sub-block highlight.
 *
 * - Occurrence spec: find the nth non-overlapping lexeme hit whose geometry
 *   falls inside `blockBounds`, render emphasized rect(s).
 * - Char-range spec: interpret `start`/`end` in `blockText` (required), map
 *   to an occurrence, same geometry path.
 * - On any failure (missing text layer, no match, bad ordinal): return
 *   whole-block fallback shapes. Never throws.
 */
export function resolveBlockSubrangeHighlight(
  options: ResolveBlockSubrangeHighlightOptions,
): BlockSubrangeHighlightResult {
  try {
    const { spec } = options;
    if (spec.kind === "occurrence") {
      if (typeof options.blockText === "string") {
        const range = resolveOccurrenceCharRange(
          options.blockText,
          spec.lexeme,
          spec.ordinal,
        );
        if (range === null) {
          return fallbackResult(options, null);
        }
      }
      const resolved = resolveOccurrenceFromTextLayer(
        options,
        spec.lexeme,
        spec.ordinal,
      );
      return resolved ?? fallbackResult(options, null);
    }

    const resolved = resolveCharRangeFromTextLayer(
      options,
      spec.start,
      spec.end,
    );
    return (
      resolved ??
      fallbackResult(options, { start: spec.start, end: spec.end })
    );
  } catch {
    return fallbackResult(options, null);
  }
}

export {
  normalizeOccurrenceLexeme,
  resolveOccurrenceCharRange,
  listOccurrenceCharRanges,
};
export type { CharRange };
