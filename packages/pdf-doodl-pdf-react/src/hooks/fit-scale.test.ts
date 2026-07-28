import { describe, expect, it } from "vitest";
import {
  computeFitHeightScale,
  computeFitModeScale,
  computeFitPageScale,
  computeFitWidthScale,
  isFitScaleActive,
  PDF_FIT_SCALE_EPSILON,
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

  it("computeFitModeScale dispatches to the matching axis formula", () => {
    expect(
      computeFitModeScale(
        "width",
        viewport.width,
        viewport.height,
        page.width,
        page.height,
      ),
    ).toBeCloseTo(computeFitWidthScale(viewport.width, page.width));
    expect(
      computeFitModeScale(
        "height",
        viewport.width,
        viewport.height,
        page.width,
        page.height,
      ),
    ).toBeCloseTo(computeFitHeightScale(viewport.height, page.height));
    expect(
      computeFitModeScale(
        "page",
        viewport.width,
        viewport.height,
        page.width,
        page.height,
      ),
    ).toBeCloseTo(
      computeFitPageScale(
        viewport.width,
        viewport.height,
        page.width,
        page.height,
      ),
    );
  });

  it("isFitScaleActive tolerates epsilon and rejects zoom steps", () => {
    const target = 1.25;
    expect(isFitScaleActive(target, target)).toBe(true);
    expect(isFitScaleActive(target + PDF_FIT_SCALE_EPSILON, target)).toBe(
      true,
    );
    expect(isFitScaleActive(target + PDF_FIT_SCALE_EPSILON * 2, target)).toBe(
      false,
    );
    expect(isFitScaleActive(target - 0.25, target)).toBe(false);
  });
});
