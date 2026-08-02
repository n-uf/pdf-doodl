import { describe, expect, it } from "vitest";

import {
  DEFAULT_OCCURRENCE_HIGHLIGHT_ROLE_STYLES,
  resolveOccurrenceHighlightsWithRoles,
  shapesForOccurrenceHighlightRoles,
  styleForOccurrenceHighlightRole,
  type OccurrenceHighlightRoleStyles,
} from "../occurrence-highlight-roles";

describe("occurrence highlight roles", () => {
  const customStyles: OccurrenceHighlightRoleStyles = {
    selected: {
      fill: "#111111",
      fillOpacity: 0.4,
      stroke: "#111111",
      strokeWidth: 2,
    },
    sibling: {
      fill: "#FFAA00",
      fillOpacity: 0.25,
      stroke: "#CC8800",
      strokeWidth: 1.5,
    },
    "plain-detect": {
      fill: "#00AACC",
      fillOpacity: 0.1,
      stroke: "#008899",
      strokeWidth: 1,
    },
  };

  it("exposes three distinct default role style slots", () => {
    const selected = styleForOccurrenceHighlightRole(
      "selected",
      DEFAULT_OCCURRENCE_HIGHLIGHT_ROLE_STYLES,
    );
    const sibling = styleForOccurrenceHighlightRole(
      "sibling",
      DEFAULT_OCCURRENCE_HIGHLIGHT_ROLE_STYLES,
    );
    const plain = styleForOccurrenceHighlightRole(
      "plain-detect",
      DEFAULT_OCCURRENCE_HIGHLIGHT_ROLE_STYLES,
    );
    expect(selected.fill).not.toBe(sibling.fill);
    expect(sibling.fill).not.toBe(plain.fill);
    expect(selected.fill).not.toBe(plain.fill);
  });

  it("paints a mixed-role box set with caller styles in one call", () => {
    const shapes = shapesForOccurrenceHighlightRoles(
      [
        {
          role: "selected",
          bounds: { x: 0, y: 0, width: 40, height: 12 },
          id: "sel",
        },
        {
          role: "sibling",
          bounds: { x: 50, y: 0, width: 40, height: 12 },
          id: "sib-a",
        },
        {
          role: "sibling",
          bounds: { x: 100, y: 0, width: 40, height: 12 },
          id: "sib-b",
        },
        {
          role: "plain-detect",
          bounds: { x: 150, y: 0, width: 40, height: 12 },
        },
      ],
      customStyles,
    );

    expect(shapes).toHaveLength(4);
    expect(shapes[0]).toMatchObject({
      id: "sel",
      type: "rect",
      style: { fill: "#111111", fillOpacity: 0.4 },
    });
    expect(shapes[1]).toMatchObject({
      id: "sib-a",
      style: { fill: "#FFAA00", fillOpacity: 0.25 },
    });
    expect(shapes[2]).toMatchObject({
      id: "sib-b",
      style: { fill: "#FFAA00" },
    });
    expect(shapes[3]).toMatchObject({
      type: "rect",
      style: { fill: "#00AACC" },
    });
    // Sibling and selected must stay visually distinct (not opacity-only).
    expect(shapes[0]?.style.fill).not.toBe(shapes[1]?.style.fill);
  });

  it("resolves a role-tagged occurrence batch with whole-block fallback", () => {
    const blockBounds = { x: 10, y: 20, width: 200, height: 40 };
    const { shapes, results } = resolveOccurrenceHighlightsWithRoles({
      styles: customStyles,
      items: [
        {
          role: "selected",
          resolve: {
            spec: {
              kind: "occurrence",
              blockId: "b0",
              lexeme: "Twente",
              ordinal: 1,
            },
            blockBounds,
            fallbackBounds: blockBounds,
            textLayer: null,
            scale: 1,
          },
        },
        {
          role: "sibling",
          resolve: {
            spec: {
              kind: "occurrence",
              blockId: "b1",
              lexeme: "Twente",
              ordinal: 1,
            },
            blockBounds: { x: 10, y: 80, width: 200, height: 40 },
            fallbackBounds: { x: 10, y: 80, width: 200, height: 40 },
            textLayer: null,
            scale: 1,
          },
        },
      ],
    });

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.mode === "fallback")).toBe(true);
    expect(shapes).toHaveLength(2);
    expect(shapes[0]?.style.fill).toBe("#111111");
    expect(shapes[1]?.style.fill).toBe("#FFAA00");
  });
});
