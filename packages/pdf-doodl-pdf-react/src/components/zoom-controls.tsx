"use client";

/**
 * ZoomControls - Optional default UI for `usePdfViewportScale`
 *
 * A minimal, unopinionated zoom/fit control strip. Consumers who want fully
 * custom chrome (matching their own design tokens) should use
 * `usePdfViewportScale` / `useCyclingFitMode` directly instead — this
 * component exists so simple integrations don't have to hand-roll buttons.
 *
 * Fit is a single cycling control: width → height → page → width. The label
 * shows the last applied mode; each click applies the next and updates it.
 */

import type { ReactElement } from "react";
import {
  PDF_FIT_CYCLE_BUTTON_CLASS,
  PDF_FIT_CYCLE_BUTTON_STYLE,
  PDF_FIT_CYCLE_LABEL_CLASS,
  PDF_ZOOM_PERCENT_BUTTON_CLASS,
  PDF_ZOOM_PERCENT_BUTTON_STYLE,
  PDF_ZOOM_STEP_BUTTON_CLASS,
  PDF_ZOOM_STEP_BUTTON_STYLE,
  fitCycleTitleFromReturn,
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
  const fit = useCyclingFitMode(viewport, {
    initialMode: initialFitMode,
  });
  const { descriptor, canFit, cycleFit } = fit;
  const fitTitle = fitCycleTitleFromReturn(fit);

  const buttonClass = `${DEFAULT_BUTTON_CLASS} ${buttonClassName}`;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={zoomOut}
        disabled={atMinZoom}
        title="Zoom out"
        style={PDF_ZOOM_STEP_BUTTON_STYLE}
        className={`${PDF_ZOOM_STEP_BUTTON_CLASS} ${buttonClass}`}
      >
        −
      </button>
      <button
        type="button"
        onClick={resetZoom}
        title="Reset zoom to 100%"
        style={PDF_ZOOM_PERCENT_BUTTON_STYLE}
        className={`${PDF_ZOOM_PERCENT_BUTTON_CLASS} ${buttonClass} ${labelClassName}`}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={zoomIn}
        disabled={atMaxZoom}
        title="Zoom in"
        style={PDF_ZOOM_STEP_BUTTON_STYLE}
        className={`${PDF_ZOOM_STEP_BUTTON_CLASS} ${buttonClass}`}
      >
        +
      </button>
      {showFit ? (
        <button
          type="button"
          onClick={cycleFit}
          disabled={!canFit}
          title={fitTitle}
          aria-label={fitTitle}
          style={PDF_FIT_CYCLE_BUTTON_STYLE}
          className={`${buttonClass} ${PDF_FIT_CYCLE_BUTTON_CLASS}`}
        >
          <span className={PDF_FIT_CYCLE_LABEL_CLASS}>
            {descriptor.icon} {descriptor.label}
          </span>
        </button>
      ) : null}
    </div>
  );
}

export default ZoomControls;
