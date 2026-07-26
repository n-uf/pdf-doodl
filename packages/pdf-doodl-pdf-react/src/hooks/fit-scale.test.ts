import { describe, expect, it } from "vitest";
import {
  computeFitHeightScale,
  computeFitPageScale,
  computeFitWidthScale,
} from "./fit-scale";

describe("fit-scale (uniform, axis-correct)", () => {
  const page = { width: 600, height: 900 };
  const viewport = { width: 800, height: 450 };

  it("fitWidth uses available.width / page.width only", () => {
    expect(computeFitWidthScale(viewport.width, page.width)).toBeCloseTo(
      800 / 600,
    );
    // Must not accidentally use height in the width formula
    expect(computeFitWidthScale(viewport.width, page.width)).not.toBeCloseTo(
      viewport.height / page.width,
    );
    expect(computeFitWidthScale(viewport.width, page.width)).not.toBeCloseTo(
      viewport.width / page.height,
    );
  });

  it("fitHeight uses available.height / page.height only", () => {
    expect(computeFitHeightScale(viewport.height, page.height)).toBeCloseTo(
      450 / 900,
    );
    expect(computeFitHeightScale(viewport.height, page.height)).not.toBeCloseTo(
      viewport.width / page.height,
    );
    expect(computeFitHeightScale(viewport.height, page.height)).not.toBeCloseTo(
      viewport.height / page.width,
    );
  });

  it("fitPage is min of the two uniform scales (contain)", () => {
    const scaleX = computeFitWidthScale(viewport.width, page.width);
    const scaleY = computeFitHeightScale(viewport.height, page.height);
    expect(
      computeFitPageScale(
        viewport.width,
        viewport.height,
        page.width,
        page.height,
      ),
    ).toBeCloseTo(Math.min(scaleX, scaleY));
  });

  it("fitWidth and fitHeight are not swapped for a portrait page", () => {
    const fitW = computeFitWidthScale(viewport.width, page.width);
    const fitH = computeFitHeightScale(viewport.height, page.height);
    // Portrait page in a wide-short viewport: width fit zooms in, height fit zooms out
    expect(fitW).toBeGreaterThan(1);
    expect(fitH).toBeLessThan(1);
    expect(fitW).not.toBeCloseTo(fitH);
  });
});
