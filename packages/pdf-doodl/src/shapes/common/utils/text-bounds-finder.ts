/**
 * Text Bounds Finder
 *
 * Utilities for finding text in a DOM text layer and returning bounding rectangles.
 * This is the reverse operation of text-intersection.ts:
 * - text-intersection: bounds → text (what text is inside this region?)
 * - text-bounds-finder: text → bounds (where does this text appear?)
 *
 * Uses the same Range API pattern as user text selection, but programmatically.
 */

import type { Bounds } from "../../../types/geometry";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Character position mapping to DOM text node
 */
interface CharPosition {
  /** The DOM Text node containing this character */
  textNode: Text;
  /** Index of this character within the text node */
  charIndex: number;
}

/**
 * Text layer map for efficient substring searching
 */
interface TextLayerMap {
  /** Concatenated text from all text nodes */
  fullText: string;
  /** Mapping from fullText index to DOM position */
  charPositions: CharPosition[];
}

/**
 * Match result with bounding rectangles
 */
export interface TextMatch {
  /** Matched text (may differ in case from search) */
  text: string;
  /** Bounding rectangles (multiple for multi-line matches) */
  bounds: Bounds[];
  /** Start index in concatenated text */
  startIndex: number;
  /** End index in concatenated text */
  endIndex: number;
}

/**
 * Match mode for text search
 *
 * - "substring": Match anywhere in text (e.g., "STD" matches inside "STANDARD")
 * - "word": Match only at word boundaries (e.g., "STD" won't match inside "STANDARD")
 */
export type TextMatchMode = "substring" | "word";

/**
 * Options for findTextInTextLayer
 */
export interface FindTextOptions {
  /** Scale factor for coordinate conversion */
  scale: number;
  /** Case-insensitive matching (default: true) */
  ignoreCase?: boolean;
  /** Maximum matches to find (default: 50) */
  maxMatches?: number;
  /** Merge adjacent/overlapping rects (default: true) */
  mergeRects?: boolean;
  /**
   * Match mode (default: "substring")
   *
   * - "substring": Find text anywhere (handles PDF font subsetting where
   *   "SOFTWARE" may be split as "SOFT"+"WARE" across text nodes)
   * - "word": Require word boundaries around match (prevents "STD" matching
   *   inside "STANDARD")
   */
  matchMode?: TextMatchMode;
}

// =============================================================================
// TEXT LAYER MAP BUILDING
// =============================================================================

// Diagnostic log prefix for easy filtering
const LOG_PREFIX = "[TextBoundsFinder]";

/**
 * Check if two DOM elements have visual separation (different lines or horizontal gap)
 *
 * Uses bounding rects to determine if elements are visually separated,
 * which indicates a word boundary vs. font subsetting split.
 *
 * @param prevElement - Previous element's parent span
 * @param currElement - Current element's parent span
 * @param threshold - Minimum gap to consider as word boundary (default: 2px)
 * @returns true if there's visual separation (should add space)
 */
function hasVisualSeparation(
  prevElement: Element | null,
  currElement: Element | null,
  threshold = 2,
): boolean {
  if (!prevElement || !currElement) return false;

  const prevRect = prevElement.getBoundingClientRect();
  const currRect = currElement.getBoundingClientRect();

  // Different lines: significant Y difference (more than line height variation)
  const yDiff = Math.abs(currRect.top - prevRect.top);
  if (yDiff > prevRect.height * 0.5) {
    return true;
  }

  // Same line but horizontal gap: space between end of prev and start of curr
  const gap = currRect.left - prevRect.right;
  if (gap > threshold) {
    return true;
  }

  return false;
}

/**
 * Get the parent span element for a text node (for position checking)
 */
function getParentSpan(textNode: Text): Element | null {
  let parent: Node | null = textNode.parentNode;
  while (parent && parent.nodeType !== Node.ELEMENT_NODE) {
    parent = parent.parentNode;
  }
  return parent as Element | null;
}

/**
 * Build a character position map from a text layer element
 *
 * Walks all text nodes in the DOM tree and creates a mapping from
 * each character position in the concatenated text to its source
 * DOM Text node and local character index.
 *
 * Uses position-aware concatenation:
 * - Visually adjacent text (font subsetting): "SOFT" + "WARE" → "SOFTWARE"
 * - Line breaks or word gaps: "software" + "development" → "software development"
 *
 * @param textLayer - The text layer DOM element
 * @returns TextLayerMap with fullText and charPositions
 */
function buildTextLayerMap(textLayer: HTMLElement): TextLayerMap {
  const fullTextChars: string[] = [];
  const charPositions: CharPosition[] = [];

  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT);
  let node: Text | null = walker.nextNode() as Text | null;
  let prevNode: Text | null = null;
  let prevSpan: Element | null = null;
  let nodeCount = 0;

  console.log(LOG_PREFIX, "Building text layer map...");

  while (node) {
    const text = node.textContent ?? "";
    if (text.length === 0) {
      node = walker.nextNode() as Text | null;
      continue;
    }

    nodeCount++;
    const currSpan = getParentSpan(node);

    // Check if we need to add a space between this node and previous
    // Only add space if:
    // 1. There was a previous node with content
    // 2. Previous didn't end with whitespace
    // 3. Current doesn't start with whitespace
    // 4. There's visual separation (different lines or horizontal gap)
    const shouldAddSpace =
      prevNode &&
      fullTextChars.length > 0 &&
      prevSpan !== currSpan && // Different spans (same span = definitely same word)
      !/\s$/.test(fullTextChars[fullTextChars.length - 1] ?? "") &&
      !/^\s/.test(text) &&
      hasVisualSeparation(prevSpan, currSpan);

    if (shouldAddSpace) {
      // Add space for visual separation (line break or word gap)
      fullTextChars.push(" ");
      charPositions.push({ textNode: node, charIndex: 0 });
      console.log(
        LOG_PREFIX,
        `Node ${nodeCount}: Added space before "${text.slice(0, 20)}..."`,
      );
    }

    // Map each character to its node position
    for (let i = 0; i < text.length; i++) {
      fullTextChars.push(text[i] ?? "");
      charPositions.push({ textNode: node, charIndex: i });
    }

    prevNode = node;
    prevSpan = currSpan;
    node = walker.nextNode() as Text | null;
  }

  const fullText = fullTextChars.join("");
  console.log(
    LOG_PREFIX,
    `Built map: ${nodeCount} nodes, ${fullText.length} chars`,
  );
  console.log(LOG_PREFIX, `Full text preview: "${fullText.slice(0, 200)}..."`);

  return { fullText, charPositions };
}

// =============================================================================
// BOUNDS MERGING
// =============================================================================

/**
 * Merge adjacent or overlapping bounds into fewer rectangles
 *
 * Groups bounds that are on the same line (similar Y position) and
 * merges horizontally adjacent bounds.
 */
function mergeAdjacentBounds(bounds: Bounds[]): Bounds[] {
  if (bounds.length <= 1) return bounds;

  // Sort by Y then X
  const sorted = [...bounds].sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) < 5) {
      // Same line (within 5px tolerance)
      return a.x - b.x;
    }
    return yDiff;
  });

  const merged: Bounds[] = [];
  let current = { ...sorted[0]! };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]!;

    // Check if same line and horizontally adjacent/overlapping
    const sameLineY = Math.abs(current.y - next.y) < 5;
    const horizontallyAdjacent = next.x <= current.x + current.width + 2;

    if (sameLineY && horizontallyAdjacent) {
      // Merge: extend current to include next
      const newRight = Math.max(current.x + current.width, next.x + next.width);
      current.width = newRight - current.x;
      // Take max height
      current.height = Math.max(current.height, next.height);
    } else {
      // Push current and start new
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Find all occurrences of text in a text layer and return their bounds
 *
 * Uses the same Range API as user text selection, but programmatically:
 * 1. Build char→node position map from text layer
 * 2. Find substring matches in concatenated text
 * 3. Create Range for each match's start/end positions
 * 4. Get bounding rects from Range.getClientRects()
 *
 * @param searchText - Text to search for
 * @param textLayer - The text layer DOM element
 * @param options - Search options
 * @returns Array of TextMatch with bounds
 *
 * @example
 * ```typescript
 * const matches = findTextInTextLayer("BlueForge", textLayerEl, { scale: 1.5 });
 * // Returns: [{ text: "BlueForge", bounds: [{x, y, width, height}], ... }]
 * ```
 */
export function findTextInTextLayer(
  searchText: string,
  textLayer: HTMLElement,
  options: FindTextOptions,
): TextMatch[] {
  const {
    scale,
    ignoreCase = true,
    maxMatches = 50,
    mergeRects = true,
    matchMode = "substring",
  } = options;

  console.log(LOG_PREFIX, `findTextInTextLayer called:`, {
    searchText: searchText.slice(0, 30),
    scale,
    ignoreCase,
    matchMode,
  });

  // Edge cases
  if (!searchText || !textLayer || scale === 0) {
    console.log(
      LOG_PREFIX,
      `Early exit: searchText=${!!searchText}, textLayer=${!!textLayer}, scale=${scale}`,
    );
    return [];
  }

  // Build character position map
  const { fullText, charPositions } = buildTextLayerMap(textLayer);

  if (fullText.length === 0 || charPositions.length === 0) {
    console.log(LOG_PREFIX, `Empty text layer map`);
    return [];
  }

  // Prepare for search
  const normalizedSearch = ignoreCase ? searchText.toLowerCase() : searchText;
  const normalizedFull = ignoreCase ? fullText.toLowerCase() : fullText;
  const layerRect = textLayer.getBoundingClientRect();

  console.log(
    LOG_PREFIX,
    `Searching for "${normalizedSearch}" in text of length ${normalizedFull.length}`,
  );

  // Check if search text exists in full text
  const firstOccurrence = normalizedFull.indexOf(normalizedSearch);
  console.log(LOG_PREFIX, `First occurrence at index: ${firstOccurrence}`);
  if (firstOccurrence >= 0) {
    const context = normalizedFull.slice(
      Math.max(0, firstOccurrence - 20),
      Math.min(
        normalizedFull.length,
        firstOccurrence + normalizedSearch.length + 20,
      ),
    );
    console.log(LOG_PREFIX, `Context around first match: "...${context}..."`);
  }

  // Word boundary check for "word" match mode
  const isWordBoundary = (char: string | undefined): boolean => {
    if (char === undefined) return true; // Start/end of text is a boundary
    // Word boundary: whitespace, punctuation, or non-alphanumeric
    return !/[a-zA-Z0-9]/.test(char);
  };

  const matches: TextMatch[] = [];
  let searchIdx = 0;

  // Find all substring matches
  while (matches.length < maxMatches) {
    const matchStart = normalizedFull.indexOf(normalizedSearch, searchIdx);
    if (matchStart === -1) break;

    const matchEnd = matchStart + searchText.length;

    // For "word" mode, check word boundaries
    if (matchMode === "word") {
      const charBefore = normalizedFull[matchStart - 1];
      const charAfter = normalizedFull[matchEnd];
      if (!isWordBoundary(charBefore) || !isWordBoundary(charAfter)) {
        // Not at word boundaries - skip this match
        searchIdx = matchStart + 1;
        continue;
      }
    }

    // Get DOM positions for match boundaries
    const startPos = charPositions[matchStart];
    const endPos = charPositions[matchEnd - 1];

    console.log(
      LOG_PREFIX,
      `Match found at ${matchStart}-${matchEnd}: "${fullText.slice(matchStart, matchEnd)}"`,
    );

    if (startPos && endPos) {
      try {
        // Create Range spanning the match
        const range = document.createRange();
        range.setStart(startPos.textNode, startPos.charIndex);
        range.setEnd(endPos.textNode, endPos.charIndex + 1);

        // Get bounding rects (multiple for multi-line text)
        const clientRects = range.getClientRects();
        const bounds: Bounds[] = [];

        console.log(
          LOG_PREFIX,
          `Range created, clientRects count: ${clientRects.length}`,
        );

        for (const rect of clientRects) {
          if (rect.width > 0 && rect.height > 0) {
            bounds.push({
              x: (rect.left - layerRect.left) / scale,
              y: (rect.top - layerRect.top) / scale,
              width: rect.width / scale,
              height: rect.height / scale,
            });
          } else {
            console.log(
              LOG_PREFIX,
              `Skipped zero-size rect: w=${rect.width}, h=${rect.height}`,
            );
          }
        }

        if (bounds.length > 0) {
          console.log(
            LOG_PREFIX,
            `Match has ${bounds.length} bounds, adding to results`,
          );
          matches.push({
            text: fullText.slice(matchStart, matchEnd),
            bounds: mergeRects ? mergeAdjacentBounds(bounds) : bounds,
            startIndex: matchStart,
            endIndex: matchEnd,
          });
        } else {
          console.log(LOG_PREFIX, `Match has NO valid bounds - skipping`);
        }
      } catch (err) {
        // Range API can throw for edge cases, skip this match
        console.log(LOG_PREFIX, `Range API error:`, err);
      }
    } else {
      console.log(
        LOG_PREFIX,
        `Missing char positions: startPos=${!!startPos}, endPos=${!!endPos}`,
      );
    }

    // Move past this match to find next
    searchIdx = matchStart + 1;
  }

  console.log(
    LOG_PREFIX,
    `Search complete: found ${matches.length} matches with bounds for "${searchText.slice(0, 20)}"`,
  );

  return matches;
}

/**
 * Check if text layer contains the search text
 *
 * Quick existence check without computing bounds.
 *
 * @param searchText - Text to search for
 * @param textLayer - The text layer DOM element
 * @param ignoreCase - Case-insensitive matching (default: true)
 * @returns true if text is found
 */
export function hasTextInTextLayer(
  searchText: string,
  textLayer: HTMLElement,
  ignoreCase = true,
): boolean {
  if (!searchText || !textLayer) return false;

  const { fullText } = buildTextLayerMap(textLayer);

  const normalizedSearch = ignoreCase ? searchText.toLowerCase() : searchText;
  const normalizedFull = ignoreCase ? fullText.toLowerCase() : fullText;

  return normalizedFull.includes(normalizedSearch);
}
