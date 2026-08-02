import { describe, expect, it } from "vitest";

import {
  resolveBlockSubrangeHighlight,
  SUBRANGE_HIGHLIGHT_STYLE,
} from "../block-subrange-highlight";

describe("resolveBlockSubrangeHighlight", () => {
  const blockBounds = { x: 10, y: 20, width: 200, height: 40 };
  const fallbackBounds = { x: 10, y: 20, width: 200, height: 40 };

  it("falls back to whole-block when text layer is null (never throws)", () => {
    const result = resolveBlockSubrangeHighlight({
      spec: {
        kind: "occurrence",
        blockId: 0,
        lexeme: "2016",
        ordinal: 1,
      },
      blockBounds,
      fallbackBounds,
      textLayer: null,
      scale: 1.5,
    });

    expect(result.mode).toBe("fallback");
    expect(result.bounds).toEqual([fallbackBounds]);
    expect(result.shapes).toHaveLength(1);
    expect(result.shapes[0]).toMatchObject({
      type: "rect",
      x: 10,
      y: 20,
      width: 200,
      height: 40,
    });
    expect(result.shapes[0]?.style).toMatchObject({
      fill: SUBRANGE_HIGHLIGHT_STYLE.fill,
    });
  });

  it("falls back when blockText cannot resolve the ordinal", () => {
    const result = resolveBlockSubrangeHighlight({
      spec: {
        kind: "occurrence",
        blockId: "b0",
        lexeme: "2016",
        ordinal: 2,
      },
      blockBounds,
      fallbackBounds,
      textLayer: null,
      scale: 1,
      blockText: "only one 2016 here",
    });
    expect(result.mode).toBe("fallback");
    expect(result.charRange).toBeNull();
  });

  it("accepts char-range specs and falls back without text geometry", () => {
    const result = resolveBlockSubrangeHighlight({
      spec: { kind: "char-range", blockId: 0, start: 5, end: 9 },
      blockBounds,
      fallbackBounds,
      textLayer: null,
      scale: 1,
      blockText: "Year 2016 then",
    });
    expect(result.mode).toBe("fallback");
    expect(result.charRange).toEqual({ start: 5, end: 9 });
  });
});
