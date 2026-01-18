import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";

interface DocumentViewerProps {
  documentId: string;
  title?: string;
  onClose?: () => void;
  allowDownload?: boolean;
}

interface DocumentPagesData {
  id: string;
  title: string;
  status: "processing" | "ready";
  pageCount: number;
  pageImages: string[];
  allowDownload: boolean;
}

export function DocumentViewer({ documentId, title, onClose, allowDownload = false }: DocumentViewerProps) {
  const [pagesData, setPagesData] = useState<DocumentPagesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    async function loadDocumentPages() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/documents/${documentId}/pages`, {
          credentials: "include",
        });
        
        if (!response.ok && response.status !== 202) {
          const data = await response.json();
          throw new Error(data.message || "Failed to load document");
        }
        
        const data: DocumentPagesData = await response.json();
        setPagesData(data);
        
        // If still processing, poll every 2 seconds
        if (data.status === "processing") {
          pollInterval = setTimeout(loadDocumentPages, 2000);
        }
      } catch (err: any) {
        console.error("Error loading document pages:", err);
        setError(err?.message || "Failed to load document");
      } finally {
        setIsLoading(false);
      }
    }

    loadDocumentPages();
    
    return () => {
      if (pollInterval) {
        clearTimeout(pollInterval);
      }
    };
  }, [documentId]);

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handlePageLoad = (pageNum: number) => {
    setLoadedPages((prev) => {
      const newSet = new Set(Array.from(prev));
      newSet.add(pageNum);
      return newSet;
    });
  };

  const handleDownload = () => {
    if (allowDownload || pagesData?.allowDownload) {
      window.open(`/api/documents/${documentId}/view`, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load document</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        {onClose && (
          <Button variant="outline" onClick={onClose} data-testid="button-doc-close-error">
            Close
          </Button>
        )}
      </div>
    );
  }

  if (!pagesData || pagesData.status === "processing" || pagesData.pageCount === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Document is being processed...</p>
        <p className="text-xs text-muted-foreground">This may take a moment. Please wait.</p>
        {onClose && (
          <Button variant="outline" onClick={onClose} data-testid="button-doc-close-processing">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" data-testid="document-viewer">
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate" data-testid="text-doc-title">
            {title || pagesData.title}
          </span>
          <span className="text-xs text-muted-foreground">
            ({pagesData.pageCount} {pagesData.pageCount === 1 ? "page" : "pages"})
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            data-testid="button-doc-zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            data-testid="button-doc-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetZoom}
            data-testid="button-doc-zoom-reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {(allowDownload || pagesData.allowDownload) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              data-testid="button-doc-download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-doc-close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-200 dark:bg-neutral-800"
      >
        <div className="flex flex-col items-center gap-4 p-4 min-w-fit">
          {Array.from({ length: pagesData.pageCount }, (_, i) => i + 1).map((pageNum) => (
            <div 
              key={pageNum} 
              className="relative bg-white shadow-lg"
              style={{ width: `${zoom * 100}%`, maxWidth: `${zoom * 800}px` }}
            >
              {!loadedPages.has(pageNum) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              <img
                src={`/api/documents/${documentId}/page/${pageNum}`}
                alt={`Page ${pageNum}`}
                className="w-full h-auto"
                onLoad={() => handlePageLoad(pageNum)}
                onContextMenu={(e) => !(allowDownload || pagesData.allowDownload) && e.preventDefault()}
                draggable={false}
                data-testid={`img-doc-page-${pageNum}`}
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {pageNum} / {pagesData.pageCount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
