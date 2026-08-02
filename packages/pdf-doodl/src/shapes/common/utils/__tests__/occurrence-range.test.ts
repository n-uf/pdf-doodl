import { describe, expect, it } from "vitest";

import {
  listOccurrenceCharRanges,
  normalizeOccurrenceLexeme,
  resolveOccurrenceCharRange,
} from "../occurrence-range";

describe("normalizeOccurrenceLexeme", () => {
  it("uppercases, trims, strips leading $, collapses whitespace", () => {
    expect(normalizeOccurrenceLexeme("  2016 ")).toBe("2016");
    expect(normalizeOccurrenceLexeme("$ 26,876.21")).toBe("26,876.21");
    expect(normalizeOccurrenceLexeme("foo\n\tbar")).toBe("FOO BAR");
  });
});

describe("resolveOccurrenceCharRange", () => {
  const schullerAwardsLine =
    "Awards Best Thesis Award 2016 and Teaching Award 2016 University";

  it("returns distinct ranges for 2016 ordinal twins (schuller-like)", () => {
    const first = resolveOccurrenceCharRange(schullerAwardsLine, "2016", 1);
    const second = resolveOccurrenceCharRange(schullerAwardsLine, "2016", 2);

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first).not.toEqual(second);

    expect(schullerAwardsLine.slice(first!.start, first!.end)).toBe("2016");
    expect(schullerAwardsLine.slice(second!.start, second!.end)).toBe("2016");
    expect(first!.end).toBeLessThanOrEqual(second!.start);
  });

  it("uses non-overlapping semantics (aaa / aa)", () => {
    // Normalized "AAA"; needle "AA" → ordinal 1 at [0,2), ordinal 2 at [2,3) only one full?
    // "AAA".indexOf("AA") at 0, next search from 2 → "A".indexOf("AA") = -1
    // So only one non-overlapping "AA" in "AAA".
    expect(resolveOccurrenceCharRange("aaa", "aa", 1)).toEqual({
      start: 0,
      end: 2,
    });
    expect(resolveOccurrenceCharRange("aaa", "aa", 2)).toBeNull();

    // "AAAA" → two non-overlapping "AA"
    expect(resolveOccurrenceCharRange("aaaa", "aa", 1)).toEqual({
      start: 0,
      end: 2,
    });
    expect(resolveOccurrenceCharRange("aaaa", "aa", 2)).toEqual({
      start: 2,
      end: 4,
    });
  });

  it("matches case-insensitively via normalization", () => {
    const text = "Year 2016 then year 2016";
    const ranges = listOccurrenceCharRanges(text, "2016");
    expect(ranges).toHaveLength(2);
    expect(ranges[0]).toEqual(
      resolveOccurrenceCharRange(text, "2016", 1),
    );
  });

  it("returns null for missing ordinal / empty inputs", () => {
    expect(resolveOccurrenceCharRange("only once 2016", "2016", 2)).toBeNull();
    expect(resolveOccurrenceCharRange("", "2016", 1)).toBeNull();
    expect(resolveOccurrenceCharRange("2016", "", 1)).toBeNull();
    expect(resolveOccurrenceCharRange("2016", "2016", 0)).toBeNull();
  });
});
