"use client";

/**
 * ZoomControls - Optional default UI for `usePdfViewportScale`
 *
 * A minimal, unopinionated zoom/fit control strip. Consumers who want fully
 * custom chrome (matching their own design tokens) should use
 * `usePdfViewportScale` directly instead — this component exists so simple
 * integrations don't have to hand-roll buttons.
 */

import type { ReactElement } from "react";
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
  /** Show the fit-width button (default: true) */
  showFitWidth?: boolean;
  /** Show the fit-height button (default: true) */
  showFitHeight?: boolean;
  /** Show the fit-page button (default: true) */
  showFitPage?: boolean;
}

const DEFAULT_BUTTON_CLASS =
  "px-2 py-1 text-xs border border-current/20 rounded-sm hover:bg-current/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

export function ZoomControls({
  viewport,
  className = "",
  buttonClassName = "",
  labelClassName = "",
  showFitWidth = true,
  showFitHeight = true,
  showFitPage = true,
}: ZoomControlsProps): ReactElement {
  const {
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
    fitWidth,
    fitHeight,
    fitPage,
    canFit,
    atMinZoom,
    atMaxZoom,
  } = viewport;

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
      {showFitWidth && (
        <button
          type="button"
          onClick={fitWidth}
          disabled={!canFit}
          title="Fit width"
          className={buttonClass}
        >
          ↔ Width
        </button>
      )}
      {showFitHeight && (
        <button
          type="button"
          onClick={fitHeight}
          disabled={!canFit}
          title="Fit height"
          className={buttonClass}
        >
          ↕ Height
        </button>
      )}
      {showFitPage && (
        <button
          type="button"
          onClick={fitPage}
          disabled={!canFit}
          title="Fit page"
          className={buttonClass}
        >
          ⬚ Page
        </button>
      )}
    </div>
  );
}

export default ZoomControls;
