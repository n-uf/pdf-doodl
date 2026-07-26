/**
 * Components for PDF annotation functionality
 */

export {
  PdfAnnotationPage,
  type PdfAnnotationPageProps,
} from "./pdf-annotation-page";
export {
  PdfAnnotationViewer,
  type PdfAnnotationViewerHandle,
  type PdfAnnotationViewerProps,
} from "./pdf-annotation-viewer";
export { ZoomControls, type ZoomControlsProps } from "./zoom-controls";
export { FindBar, type FindBarProps } from "./find-bar";

// Re-export Document from react-pdf to ensure context sharing
// When Document and Page come from the same module instance, React context works
export { Document as PdfDocument, pdfjs } from "react-pdf";

