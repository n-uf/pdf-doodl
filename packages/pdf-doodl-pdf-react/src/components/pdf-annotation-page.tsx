"use client";

/**
 * PdfAnnotationPage - Single PDF page with annotation overlay
 *
 * Composes:
 * - react-pdf Page component for PDF rendering
 * - PageAnnotationLayer from doodl-react for annotation canvas
 * - Text layer capture for text-highlight tool
 */

import type { DrawShape, DrawTool, ShapeStyle } from "@n-uf/pdf-doodl";
import {
  PageAnnotationLayer,
  type PageAnnotationController,
} from "@n-uf/pdf-doodl-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Page } from "react-pdf";
import type { PageDimensions, PageRenderResult } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface PdfAnnotationPageProps {
  /** Page number (1-indexed) */
  pageNumber: number;
  /** Current scale factor */
  scale: number;
  /** Shapes for this page (page coordinates) */
  shapes?: DrawShape[];
  /** Current annotation tool */
  tool?: DrawTool;
  /** Current annotation style */
  style?: ShapeStyle;
  /** Whether annotations are enabled (default: true) */
  annotationsEnabled?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Merge overlapping text highlight rects (default: true) */
  mergeHighlights?: boolean;
  /** Callback when shapes change */
  onShapesChange?: (shapes: DrawShape[]) => void;
  /** Callback when history state changes */
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
  /** Callback when page dimensions are known */
  onDimensionsChange?: (dimensions: PageDimensions) => void;
  /** Callback when page renders successfully */
  onRenderSuccess?: (page: PageRenderResult) => void;
  /** Callback when text layer element is captured */
  onTextLayerChange?: (element: HTMLElement | null) => void;
  /** Controller ref for external access */
  controllerRef?: React.MutableRefObject<PageAnnotationController | null>;
  /** Render text layer (required for text-highlight tool, default: true) */
  renderTextLayer?: boolean;
  /** Render annotation layer from PDF (default: false) */
  renderAnnotationLayer?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Additional style for the container */
  style_?: React.CSSProperties;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Single PDF page with annotation overlay
 *
 * @example
 * ```tsx
 * <Document file={pdfFile}>
 *   <PdfAnnotationPage
 *     pageNumber={1}
 *     scale={1.5}
 *     tool="text-highlight"
 *     shapes={pageShapes}
 *     onShapesChange={setPageShapes}
 *   />
 * </Document>
 * ```
 */
export const PdfAnnotationPage: React.FC<PdfAnnotationPageProps> = ({
  pageNumber,
  scale,
  shapes,
  tool = "select",
  style,
  annotationsEnabled = true,
  readOnly = false,
  mergeHighlights = true,
  onShapesChange,
  onHistoryChange,
  onDimensionsChange,
  onRenderSuccess,
  onTextLayerChange,
  controllerRef,
  renderTextLayer = true,
  renderAnnotationLayer = false,
  className = "",
  style_,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textLayerElement, setTextLayerElement] = useState<HTMLElement | null>(
    null
  );
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null
  );

  // Notify parent when text layer changes
  useEffect(() => {
    onTextLayerChange?.(textLayerElement);
  }, [textLayerElement, onTextLayerChange]);

  // Handle page render success
  const handleRenderSuccess = useCallback(
    (page: PageRenderResult) => {
      const dims: PageDimensions = {
        width: page.originalWidth,
        height: page.originalHeight,
      };
      setPageDimensions(dims);

      onDimensionsChange?.(dims);
      onRenderSuccess?.(page);

      // Capture text layer after render
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          const textLayer = container.querySelector(
            ".react-pdf__Page__textContent"
          ) as HTMLElement | null;
          setTextLayerElement(textLayer);
        }
      });
    },
    [onDimensionsChange, onRenderSuccess]
  );

  // Re-capture text layer when scale prop changes
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) {
        const textLayer = container.querySelector(
          ".react-pdf__Page__textContent"
        ) as HTMLElement | null;
        setTextLayerElement(textLayer);
      }
    });
  }, [scale]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style_}>
      {/* PDF Page */}
      <Page
        pageNumber={pageNumber}
        scale={scale}
        onRenderSuccess={handleRenderSuccess}
        renderTextLayer={renderTextLayer}
        renderAnnotationLayer={renderAnnotationLayer}
      />

      {/* Annotation Layer */}
      {annotationsEnabled && pageDimensions && (
        <PageAnnotationLayer
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          scale={scale}
          textLayerElement={textLayerElement}
          tool={tool}
          style={style}
          shapes={shapes}
          enabled={!readOnly}
          mergeHighlights={mergeHighlights}
          onShapesChange={onShapesChange}
          onHistoryChange={onHistoryChange}
          controllerRef={controllerRef}
          className="pointer-events-auto"
        />
      )}
    </div>
  );
};

export default PdfAnnotationPage;
