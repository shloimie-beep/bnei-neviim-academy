import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, Loader2, Maximize, Minimize, X, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Use worker from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PdfViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  allowDownload?: boolean;
}

export function PdfViewer({ url, title, onClose, allowDownload = false }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const lastScaleRef = useRef<number>(1.0);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, forceUpdate] = useState(0);

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
          renderedPagesRef.current.clear();
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error loading PDF:", err, "URL:", url);
          const errorMsg = err?.message || err?.name || (typeof err === 'string' ? err : JSON.stringify(err)) || "Failed to load document";
          setError(errorMsg);
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

  // Render a specific page
  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement, forceRender = false) => {
    if (!pdf) return;
    
    // Skip if already rendered at current scale (unless forced)
    if (!forceRender && renderedPagesRef.current.has(pageNum) && lastScaleRef.current === scale) {
      return;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const context = canvas.getContext("2d");
      
      if (!context) return;

      // Get the base viewport at scale 1.0
      const baseViewport = page.getViewport({ scale: 1.0 });
      
      // Calculate display scale based on container width for initial fit
      const containerWidth = scrollContainerRef.current?.clientWidth || 800;
      const baseScale = Math.min((containerWidth - 32) / baseViewport.width, 1.5);
      
      // Apply user scale on top of base scale
      const dpr = window.devicePixelRatio || 1;
      const displayScale = baseScale * scale;
      const renderScale = displayScale * dpr;
      
      // Get viewport with proper scale
      const viewport = page.getViewport({ scale: renderScale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Set display size (divide by dpr to get CSS pixels)
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      renderedPagesRef.current.add(pageNum);
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  }, [pdf, scale]);

  // Re-render all pages when scale changes
  useEffect(() => {
    if (!pdf) return;
    
    // Clear rendered pages cache when scale changes
    if (lastScaleRef.current !== scale) {
      renderedPagesRef.current.clear();
      lastScaleRef.current = scale;
      
      // Re-render all currently visible pages
      pageRefs.current.forEach((canvas, pageNum) => {
        renderPage(pageNum, canvas, true);
      });
    }
  }, [scale, pdf, renderPage]);

  // Initial render of visible pages
  useEffect(() => {
    if (!pdf || totalPages === 0) return;

    // Render first few pages immediately
    const initialPages = Math.min(3, totalPages);
    for (let i = 1; i <= initialPages; i++) {
      const canvas = pageRefs.current.get(i);
      if (canvas) {
        renderPage(i, canvas);
      }
    }
  }, [pdf, totalPages, renderPage]);

  // Intersection observer for lazy loading and current page tracking
  useEffect(() => {
    if (!scrollContainerRef.current || totalPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute("data-page") || "1");
          
          if (entry.isIntersecting) {
            // Render the page when it becomes visible
            const canvas = pageRefs.current.get(pageNum);
            if (canvas && !renderedPagesRef.current.has(pageNum)) {
              renderPage(pageNum, canvas);
            }
            
            // Update current page based on visibility
            if (entry.intersectionRatio > 0.5) {
              setCurrentPage(pageNum);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "100px",
        threshold: [0, 0.5, 1],
      }
    );

    // Observe all page containers
    const containers = scrollContainerRef.current.querySelectorAll("[data-page]");
    containers.forEach((container) => observer.observe(container));

    return () => observer.disconnect();
  }, [totalPages, renderPage]);

  // Block keyboard shortcuts for save/print (unless allowed)
  useEffect(() => {
    if (allowDownload) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    containerRef.current?.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      containerRef.current?.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [allowDownload]);

  // Prevent page zoom on pinch (mobile) - only zoom PDF content
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTouchDistance = 0;
    let initialScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (lastTouchDistance > 0) {
          const scaleFactor = currentDistance / lastTouchDistance;
          const newScale = Math.max(0.5, Math.min(3, initialScale * scaleFactor));
          setScale(newScale);
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scale]);

  const scrollToPage = (pageNum: number) => {
    const container = scrollContainerRef.current?.querySelector(`[data-page="${pageNum}"]`);
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.25, 0.5));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleDownload = useCallback(() => {
    if (allowDownload) {
      window.open(url, "_blank");
    }
  }, [url, allowDownload]);

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
        isFullscreen 
          ? "fixed inset-0 z-50" 
          : "h-full"
      }`}
      style={{ touchAction: "pan-x pan-y" }}
      data-testid="pdf-viewer"
    >
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            data-testid="button-pdf-prev"
          >
            <ChevronUp className="h-4 w-4" />
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
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleZoomOut(); }}
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
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleZoomIn(); }}
            disabled={scale >= 3}
            data-testid="button-pdf-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {allowDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(); }}
              data-testid="button-pdf-download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFullscreen(); }}
            data-testid="button-pdf-fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              data-testid="button-pdf-close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-muted/30"
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        <div className="flex flex-col items-center gap-2 py-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <div 
              key={pageNum}
              data-page={pageNum}
              className="flex justify-center"
            >
              <canvas
                ref={(el) => {
                  if (el) {
                    pageRefs.current.set(pageNum, el);
                  } else {
                    pageRefs.current.delete(pageNum);
                  }
                }}
                className="shadow-md"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
