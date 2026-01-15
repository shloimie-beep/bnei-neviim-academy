import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Maximize, Minimize, X, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Use worker from public directory (legacy build for compatibility)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PdfViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  allowDownload?: boolean;
}

export function PdfViewer({ url, title, onClose, allowDownload = false }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadingTask = pdfjsLib.getDocument({
          url,
          withCredentials: true,
        });
        
        const pdfDoc = await loadingTask.promise;
        
        if (!cancelled) {
          setPdf(pdfDoc);
          setTotalPages(pdfDoc.numPages);
          setCurrentPage(1);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error loading PDF:", err);
          setError(err?.message || "Failed to load document");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;

    async function renderPage() {
      try {
        const page = await pdf!.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Fill white background
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdf, currentPage, scale]);

  // Block keyboard shortcuts for save/print (unless allowed)
  useEffect(() => {
    if (allowDownload) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [allowDownload]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(s + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(s - 0.25, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleDownload = () => {
    if (allowDownload) {
      window.open(url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-destructive">Failed to load document</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col select-none bg-background ${
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      }`}
      data-testid="pdf-viewer"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            data-testid="button-pdf-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[80px] text-center" data-testid="text-pdf-page">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            data-testid="button-pdf-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            data-testid="button-pdf-zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            data-testid="button-pdf-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {allowDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              data-testid="button-pdf-download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            data-testid="button-pdf-fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-pdf-close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-neutral-200 dark:bg-neutral-800">
        <div className="flex justify-center p-4">
          <canvas
            ref={canvasRef}
            className="shadow-lg"
            onContextMenu={(e) => !allowDownload && e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}
