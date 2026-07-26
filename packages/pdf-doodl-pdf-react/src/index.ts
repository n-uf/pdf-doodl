/**
 * @n-uf/pdf-doodl-pdf-react
 *
 * PDF annotation components and hooks for React.
 * Combines react-pdf rendering with doodl annotation capabilities.
 *
 * NOTE: Components that use react-pdf must be imported from "./components"
 * directly to avoid SSR issues. The main entry only exports hooks and types
 * which are safe to import on the server.
 */

// Hooks (SSR-safe)
export {
  usePdfAnnotations,
  usePdfTextLayer,
  usePdfTextLayerAuto,
} from "./hooks";

// Utilities (SSR-safe - guard for document internally)
export {
  // Text layer utilities
  getAnnotationTextLayer,
  getAnnotationTextLayersByPage,
  getAnnotationTextLayerForPage,
  PDF_TEXT_LAYER_SELECTOR,
  // Annotation display utilities
  ANNOTATION_TYPE_LABELS,
  ANNOTATION_TYPE_ICONS,
  ANNOTATION_TYPE_ORDER,
  getAnnotationDisplayInfo,
  compareAnnotationTypes,
  type AnnotationDisplayInfo,
} from "./utils";

// Types (SSR-safe)
export type {
  PageAnnotations,
  PageDimensions,
  PageRenderResult,
  PdfAnnotationBaseProps,
  PdfSource,
  PdfViewMode,
  SerializedPageAnnotations,
  UsePdfAnnotationsReturn,
  UsePdfTextLayerReturn,
} from "./types";

// Component types only (not the implementations)
export type { PdfAnnotationPageProps } from "./components/pdf-annotation-page";
export type {
  PdfAnnotationViewerHandle,
  PdfAnnotationViewerProps,
} from "./components/pdf-annotation-viewer";

