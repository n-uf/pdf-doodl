"use client";

/**
 * Cycles fit-width → fit-height → fit-page through a single control.
 *
 * The button shows the mode that the next click will apply; on click it
 * applies that fit and advances the label to the following mode.
 */

import { useCallback, useState } from "react";
import type { UsePdfViewportScaleReturn } from "./use-pdf-viewport-scale";

export type PdfFitMode = "width" | "height" | "page";

export interface PdfFitModeDescriptor {
  mode: PdfFitMode;
  icon: string;
  label: string;
  title: string;
}

export const PDF_FIT_MODE_ORDER: readonly PdfFitMode[] = [
  "width",
  "height",
  "page",
] as const;

const FIT_MODE_DESCRIPTORS: Record<PdfFitMode, PdfFitModeDescriptor> = {
  width: {
    mode: "width",
    icon: "↔",
    label: "Width",
    title: "Fit width",
  },
  height: {
    mode: "height",
    icon: "↕",
    label: "Height",
    title: "Fit height",
  },
  page: {
    mode: "page",
    icon: "⬚",
    label: "Page",
    title: "Fit page",
  },
};

export function getPdfFitModeDescriptor(mode: PdfFitMode): PdfFitModeDescriptor {
  return FIT_MODE_DESCRIPTORS[mode];
}

/** Icon + space + longest label ("Height") — keeps cycle button width stable. */
export const PDF_FIT_CYCLE_LABEL_CLASS =
  "inline-flex min-w-[8ch] items-center justify-center";

export function nextPdfFitMode(mode: PdfFitMode): PdfFitMode {
  const index = PDF_FIT_MODE_ORDER.indexOf(mode);
  const nextIndex = (index + 1) % PDF_FIT_MODE_ORDER.length;
  return PDF_FIT_MODE_ORDER[nextIndex] ?? "width";
}

export type CyclingFitViewport = Pick<
  UsePdfViewportScaleReturn,
  "fitWidth" | "fitHeight" | "fitPage" | "canFit"
>;

export interface UseCyclingFitModeOptions {
  /** Mode shown (and applied) on the first click. Default: `"width"`. */
  initialMode?: PdfFitMode;
}

export interface UseCyclingFitModeReturn {
  /** Mode that the next click will apply. */
  mode: PdfFitMode;
  descriptor: PdfFitModeDescriptor;
  canFit: boolean;
  /** Apply the currently displayed fit mode, then advance to the next. */
  cycleFit: () => void;
}

export function useCyclingFitMode(
  viewport: CyclingFitViewport,
  options: UseCyclingFitModeOptions = {},
): UseCyclingFitModeReturn {
  const { initialMode = "width" } = options;
  const [mode, setMode] = useState<PdfFitMode>(initialMode);
  const { fitWidth, fitHeight, fitPage, canFit } = viewport;

  const descriptor = getPdfFitModeDescriptor(mode);

  const cycleFit = useCallback(() => {
    switch (mode) {
      case "width":
        fitWidth();
        break;
      case "height":
        fitHeight();
        break;
      case "page":
        fitPage();
        break;
    }
    setMode(nextPdfFitMode(mode));
  }, [mode, fitWidth, fitHeight, fitPage]);

  return { mode, descriptor, canFit, cycleFit };
}
