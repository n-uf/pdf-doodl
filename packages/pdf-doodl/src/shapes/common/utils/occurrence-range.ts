/**
 * Occurrence char-range resolution for sub-block highlights.
 *
 * Semantics match pdf-n-learn ground-truth `span.ordinal`:
 * - Lexeme normalization: uppercase, trim, strip leading `$` (+ optional
 *   following space), collapse internal whitespace to a single space.
 * - Ordinal is the 1-based index of the **non-overlapping** left-to-right
 *   match of the normalized lexeme within the normalized block text.
 * - Non-overlapping: after a hit at normalized index `i` of length `n`, the
 *   next search starts at `i + n` (not `i + 1`).
 */

export interface CharRange {
  /** Inclusive start index in the *original* (pre-normalization) block text. */
  start: number;
  /** Exclusive end index in the *original* block text. */
  end: number;
}

/**
 * Normalize a lexeme the same way as pdf-n-learn `normalize_lexeme`.
 */
export function normalizeOccurrenceLexeme(lexeme: string): string {
  return lexeme
    .toUpperCase()
    .trim()
    .replace(/^\$\s*/, "")
    .replace(/\s+/g, " ");
}

interface NormalizedMap {
  /** Normalized text (uppercase, collapsed whitespace, leading `$` stripped). */
  normalized: string;
  /**
   * For each index in `normalized` (plus one sentinel at the end), the
   * corresponding index in the original string. Length = normalized.length + 1.
   */
  origIndex: number[];
}

/**
 * Build a normalized view of `text` with a map back to original indices.
 *
 * Leading `$` strip applies to the whole string (lexeme-style), matching
 * `normalize_lexeme` on a block that itself begins with currency — rare for
 * block text, but keeps single-lexeme normalization identical.
 */
function buildNormalizedMap(text: string): NormalizedMap {
  const trimmed = text.replace(/^\s+/, "").replace(/\s+$/, "");
  const trimStart = text.length - text.replace(/^\s+/, "").length;

  let working = trimmed;
  let workingOffset = trimStart;
  const dollarMatch = /^\$\s*/.exec(working);
  if (dollarMatch !== null) {
    workingOffset += dollarMatch[0].length;
    working = working.slice(dollarMatch[0].length);
  }

  const normalizedChars: string[] = [];
  const origIndex: number[] = [];
  let i = 0;
  let lastWasSpace = false;

  while (i < working.length) {
    const ch = working[i] ?? "";
    const orig = workingOffset + i;
    if (/\s/.test(ch)) {
      // Collapse any whitespace run to a single space.
      let j = i + 1;
      while (j < working.length && /\s/.test(working[j] ?? "")) {
        j += 1;
      }
      if (!lastWasSpace && normalizedChars.length > 0) {
        normalizedChars.push(" ");
        origIndex.push(orig);
        lastWasSpace = true;
      }
      i = j;
      continue;
    }
    normalizedChars.push(ch.toUpperCase());
    origIndex.push(orig);
    lastWasSpace = false;
    i += 1;
  }

  // Sentinel: end of normalized → end of the trimmed/working region in orig.
  const endOrig = workingOffset + working.length;
  origIndex.push(endOrig);

  return { normalized: normalizedChars.join(""), origIndex };
}

/**
 * Resolve the nth non-overlapping normalized occurrence of `lexeme` in
 * `blockText` to a char range in the original `blockText`.
 *
 * @param blockText - Anchored block text (reading order)
 * @param lexeme - Surface lexeme (will be normalized)
 * @param ordinal - 1-based occurrence index
 * @returns Char range in `blockText`, or `null` when missing / invalid
 */
export function resolveOccurrenceCharRange(
  blockText: string,
  lexeme: string,
  ordinal: number,
): CharRange | null {
  if (typeof blockText !== "string" || blockText.length === 0) return null;
  if (typeof lexeme !== "string" || lexeme.length === 0) return null;
  if (!Number.isInteger(ordinal) || ordinal < 1) return null;

  const needle = normalizeOccurrenceLexeme(lexeme);
  if (needle.length === 0) return null;

  const { normalized, origIndex } = buildNormalizedMap(blockText);
  if (normalized.length === 0) return null;

  let searchFrom = 0;
  let found = 0;
  while (found < ordinal) {
    const idx = normalized.indexOf(needle, searchFrom);
    if (idx === -1) return null;
    found += 1;
    if (found === ordinal) {
      const start = origIndex[idx];
      const end = origIndex[idx + needle.length];
      if (start === undefined || end === undefined || end <= start) return null;
      return { start, end };
    }
    searchFrom = idx + needle.length;
  }
  return null;
}

/**
 * List every non-overlapping occurrence char range for `lexeme` in `blockText`.
 */
export function listOccurrenceCharRanges(
  blockText: string,
  lexeme: string,
): CharRange[] {
  const ranges: CharRange[] = [];
  let ordinal = 1;
  while (true) {
    const range = resolveOccurrenceCharRange(blockText, lexeme, ordinal);
    if (range === null) break;
    ranges.push(range);
    ordinal += 1;
    if (ordinal > blockText.length + 1) break; // safety
  }
  return ranges;
}
