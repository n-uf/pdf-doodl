"use client";

/**
 * ZoomControls - Optional default UI for `usePdfViewportScale`
 *
 * A minimal, unopinionated zoom/fit control strip. Consumers who want fully
 * custom chrome (matching their own design tokens) should use
 * `usePdfViewportScale` / `useCyclingFitMode` directly instead — this
 * component exists so simple integrations don't have to hand-roll buttons.
 *
 * Fit is a single cycling control: width → height → page → width. Each click
 * applies the displayed mode and advances the label to the next.
 */

import type { ReactElement } from "react";
import {
  PDF_FIT_CYCLE_BUTTON_CLASS,
  PDF_FIT_CYCLE_LABEL_CLASS,
  useCyclingFitMode,
  type PdfFitMode,
} from "../hooks/use-cycling-fit-mode";
import type { UsePdfViewportScaleReturn } from "../hooks/use-pdf-viewport-scale";

export interface ZoomControlsProps {
  /** Return value of `usePdfViewportScale` */
  viewport: UsePdfViewportScaleReturn;
  /** Additional className for the root container */
  className?: string;
  /** Additional className applied to every button */
  buttonClassName?: string;
  /** Additional className for the percentage label */
  labelClassName?: string;
  /** Show the cycling fit control (default: true) */
  showFit?: boolean;
  /** Mode shown (and applied) on the first fit click. Default: `"width"`. */
  initialFitMode?: PdfFitMode;
}

const DEFAULT_BUTTON_CLASS =
  "px-2 py-1 text-xs border border-current/20 rounded-sm hover:bg-current/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

export function ZoomControls({
  viewport,
  className = "",
  buttonClassName = "",
  labelClassName = "",
  showFit = true,
  initialFitMode = "width",
}: ZoomControlsProps): ReactElement {
  const { scale, zoomIn, zoomOut, resetZoom, atMinZoom, atMaxZoom } = viewport;
  const { descriptor, canFit, cycleFit } = useCyclingFitMode(viewport, {
    initialMode: initialFitMode,
  });

  const buttonClass = `${DEFAULT_BUTTON_CLASS} ${buttonClassName}`;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={zoomOut}
        disabled={atMinZoom}
        title="Zoom out"
        className={buttonClass}
      >
        −
      </button>
      <button
        type="button"
        onClick={resetZoom}
        title="Reset zoom to 100%"
        className={`min-w-[3.5rem] text-center ${buttonClass} ${labelClassName}`}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={zoomIn}
        disabled={atMaxZoom}
        title="Zoom in"
        className={buttonClass}
      >
        +
      </button>
      {showFit && (
        <button
          type="button"
          onClick={cycleFit}
          disabled={!canFit}
          title={`${descriptor.title} — click to cycle`}
          aria-label={`${descriptor.title} (click to cycle fit mode)`}
          className={`${buttonClass} ${PDF_FIT_CYCLE_BUTTON_CLASS}`}
        >
          <span className={PDF_FIT_CYCLE_LABEL_CLASS}>
            {descriptor.icon} {descriptor.label}
          </span>
        </button>
      )}
    </div>
  );
}

export default ZoomControls;
