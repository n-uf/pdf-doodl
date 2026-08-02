import { describe, expect, it } from "vitest";
import {
  getPdfFitCycleTitle,
  getPdfFitModeDescriptor,
  resolveCyclingFitApplyMode,
} from "./use-cycling-fit-mode";

describe("resolveCyclingFitApplyMode", () => {
  it("applies initialMode on first click (never applied)", () => {
    expect(resolveCyclingFitApplyMode(null, "width", false)).toBe("width");
    expect(resolveCyclingFitApplyMode(null, "height", false)).toBe("height");
  });

  it("re-applies shown mode when inactive after manual zoom", () => {
    expect(resolveCyclingFitApplyMode("width", "width", false)).toBe("width");
    expect(resolveCyclingFitApplyMode("height", "width", false)).toBe(
      "height",
    );
    expect(resolveCyclingFitApplyMode("page", "width", false)).toBe("page");
  });

  it("advances the cycle only while the shown fit is active", () => {
    expect(resolveCyclingFitApplyMode("width", "width", true)).toBe("height");
    expect(resolveCyclingFitApplyMode("height", "width", true)).toBe("page");
    expect(resolveCyclingFitApplyMode("page", "width", true)).toBe("width");
  });
});

describe("getPdfFitCycleTitle", () => {
  it("says click to apply when next equals current (re-enable)", () => {
    const width = getPdfFitModeDescriptor("width");
    expect(getPdfFitCycleTitle(width, width)).toBe(
      "Fit width — click to apply",
    );
  });

  it("names the next mode when advancing", () => {
    const width = getPdfFitModeDescriptor("width");
    const height = getPdfFitModeDescriptor("height");
    expect(getPdfFitCycleTitle(width, height)).toBe(
      "Fit width — click for height",
    );
  });
});
