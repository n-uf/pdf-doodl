/**
 * Hooks for PDF annotation functionality
 */

export { usePdfAnnotations } from "./use-pdf-annotations";
export { usePdfTextLayer, usePdfTextLayerAuto } from "./use-pdf-text-layer";
export {
  usePdfViewportScale,
  type PdfPageSize,
  type UsePdfViewportScaleOptions,
  type UsePdfViewportScaleReturn,
} from "./use-pdf-viewport-scale";
export {
  useCyclingFitMode,
  getPdfFitModeDescriptor,
  nextPdfFitMode,
  PDF_FIT_CYCLE_BUTTON_CLASS,
  PDF_FIT_CYCLE_LABEL_CLASS,
  PDF_ZOOM_PERCENT_BUTTON_CLASS,
  PDF_ZOOM_STEP_BUTTON_CLASS,
  PDF_FIT_MODE_ORDER,
  type CyclingFitViewport,
  type PdfFitMode,
  type PdfFitModeDescriptor,
  type UseCyclingFitModeOptions,
  type UseCyclingFitModeReturn,
} from "./use-cycling-fit-mode";
export {
  usePdfFind,
  type FindMatchRef,
  type UsePdfFindOptions,
  type UsePdfFindReturn,
} from "./use-pdf-find";

