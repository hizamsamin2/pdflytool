"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn, formatBytes } from "@/lib/utils";
import { Loader2, ChevronLeft, ChevronRight, X, GripVertical, AlertCircle, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    pdfjsLib?: typeof import("pdfjs-dist");
  }
}

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  pdfjsLib = pdfjs;
  return pdfjs;
}

// Cache PDF documents to avoid re-parsing
const pdfCache = new Map<string, { doc: import("pdfjs-dist").PDFDocumentProxy; lastUsed: number }>();

async function getCachedPdf(file: File) {
  const key = `${file.name}-${file.size}-${file.lastModified}`;
  const cached = pdfCache.get(key);
  if (cached) {
    cached.lastUsed = Date.now();
    return cached.doc;
  }
  const pdfjs = await getPdfjs();
  const buffer = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  pdfCache.set(key, { doc, lastUsed: Date.now() });

  // Cleanup old cache entries (keep last 5)
  if (pdfCache.size > 5) {
    const sorted = Array.from(pdfCache.entries()).sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    const toDelete = sorted.slice(0, sorted.length - 5);
    toDelete.forEach(([k, v]) => {
      v.doc.destroy().catch(() => {});
      pdfCache.delete(k);
    });
  }

  return doc;
}

export interface PageMetadata {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PreviewFile {
  file: File;
  pages: PageMetadata[];
  pageOrder?: number[];
}

interface PdfPreviewProps {
  file: File | null;
  onChange?: (file: PreviewFile) => void;
  mode: "merge" | "remove" | "rotate" | "view";
  selectedPages?: Set<number>;
  onSelectionChange?: (pages: Set<number>) => void;
  rotation?: number;
  pageOrder?: number[];
  onOrderChange?: (order: number[]) => void;
  showOrder?: boolean;
}

export function PdfPreview({
  file,
  onChange,
  mode,
  selectedPages: externalSelected,
  onSelectionChange,
  rotation = 0,
  pageOrder: externalOrder,
  onOrderChange,
  showOrder = false,
}: PdfPreviewProps) {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [internalSelected, setInternalSelected] = useState<Set<number>>(new Set());
  const [order, setOrder] = useState<number[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const selected = externalSelected ?? internalSelected;
  const setSelected = (s: Set<number>) => {
    if (onSelectionChange) onSelectionChange(s);
    else setInternalSelected(s);
  };

  const currentOrder = externalOrder ?? order;
  const setCurrentOrder = (o: number[]) => {
    if (onOrderChange) onOrderChange(o);
    else setOrder(o);
  };

  useEffect(() => {
    if (!file) {
      setPages([]);
      setCurrentOrder([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const doc = await getCachedPdf(file);
        const pageCount = doc.numPages;
        const meta: PageMetadata[] = [];
        for (let i = 1; i <= pageCount; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          meta.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
            rotation: viewport.rotation,
          });
        }
        setPages(meta);
        setCurrentOrder(meta.map((p) => p.pageNumber));
        setSelected(new Set());
        if (onChange) {
          onChange({ file, pages: meta, pageOrder: meta.map((p) => p.pageNumber) });
        }
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load PDF preview");
        setLoading(false);
      }
    };
    load();
  }, [file]);

  const togglePage = (pageNum: number) => {
    const next = new Set(selected);
    if (next.has(pageNum)) next.delete(pageNum);
    else next.add(pageNum);
    setSelected(next);
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newOrder = [...currentOrder];
    [newOrder[draggedIdx], newOrder[idx]] = [newOrder[idx], newOrder[draggedIdx]];
    setCurrentOrder(newOrder);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  if (!file) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {file.name} • {formatBytes(file.size)} • {pages.length} page{pages.length !== 1 ? "s" : ""}
        </div>
        {mode === "remove" && selected.size > 0 && (
          <div className="text-destructive font-medium">
            {selected.size} page{selected.size !== 1 ? "s" : ""} will be removed
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Preview unavailable: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 bg-muted/30 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading preview...</span>
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">No pages to preview</p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-3",
          mode === "rotate" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        )}>
          {currentOrder.map((pageNum, idx) => {
            const page = pages.find((p) => p.pageNumber === pageNum);
            if (!page) return null;
            const isSelected = selected.has(pageNum);
            const isDragging = draggedIdx === idx;
            const aspectRatio = page.width / page.height;

            return (
              <div
                key={`${pageNum}-${idx}`}
                draggable={showOrder || mode === "merge"}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative rounded-lg border-2 bg-card overflow-hidden transition cursor-pointer hover:shadow-md hover:border-primary/50",
                  isSelected && mode === "remove" && "border-destructive ring-2 ring-destructive/30",
                  !isSelected && mode === "remove" && "hover:border-destructive/30",
                  isDragging && "opacity-50 scale-95 shadow-2xl",
                  mode === "rotate" && "hover:border-primary"
                )}
                onClick={() => {
                  if (mode === "remove") togglePage(pageNum);
                  else if (mode === "view" || mode === "rotate") setPreviewPage(pageNum);
                }}
              >
                {(showOrder || mode === "merge") && (
                  <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                    <GripVertical className="h-3 w-3" />
                    {idx + 1}
                  </div>
                )}

                {mode === "remove" && (
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className={cn(
                        "h-6 w-6 rounded border-2 flex items-center justify-center transition shadow-md",
                        isSelected ? "bg-destructive border-destructive text-white" : "bg-white/95 border-gray-300"
                      )}
                    >
                      {isSelected && <X className="h-3 w-3" />}
                    </div>
                  </div>
                )}

                {(mode === "view" || mode === "rotate") && (
                  <div className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className="bg-white flex items-center justify-center p-2"
                  style={{ aspectRatio: `${aspectRatio}` }}
                >
                  <PageThumbnail
                    file={file}
                    pageNumber={pageNum}
                    rotation={mode === "rotate" ? rotation : 0}
                  />
                </div>

                <div className="px-2 py-1.5 bg-muted text-xs text-center font-medium">
                  Page {pageNum}
                </div>

                {isSelected && mode === "remove" && (
                  <div className="absolute inset-0 bg-destructive/20 pointer-events-none rounded-lg" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {(showOrder || mode === "merge") && !loading && pages.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Drag pages to reorder
        </p>
      )}

      {mode === "remove" && !loading && pages.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Click pages to mark them for removal
        </p>
      )}

      {(mode === "view" || mode === "rotate") && !loading && pages.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Click any page to view full-size
        </p>
      )}

      {previewPage !== null && (
        <PageModal
          file={file}
          pageNumber={previewPage}
          totalPages={pages.length}
          onClose={() => setPreviewPage(null)}
          onPrev={() => setPreviewPage(Math.max(1, previewPage - 1))}
          onNext={() => setPreviewPage(Math.min(pages.length, previewPage + 1))}
          rotation={rotation}
        />
      )}
    </div>
  );
}

function PageThumbnail({
  file,
  pageNumber,
  rotation,
}: {
  file: File;
  pageNumber: number;
  rotation: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  const render = useCallback(async () => {
    if (!containerRef.current || !canvasRef.current) return;
    try {
      setLoading(true);
      setError(null);

      const doc = await getCachedPdf(file);
      const page = await doc.getPage(pageNumber);

      // Get container size for proper scaling
      const container = containerRef.current;
      const containerWidth = container.clientWidth || 200;
      const containerHeight = container.clientHeight || 280;

      const baseViewport = page.getViewport({ scale: 1, rotation });

      // Try multiple scale strategies
      const strategies = [
        Math.min(containerWidth / baseViewport.width, containerHeight / baseViewport.height) * (window.devicePixelRatio || 1),
        Math.min(containerWidth / baseViewport.width, containerHeight / baseViewport.height) * 1.5,
        Math.min(containerWidth / baseViewport.width, containerHeight / baseViewport.height),
      ];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Cannot get canvas context");

      let lastError: Error | null = null;

      // Try each strategy with retry for canvas conflict
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const scale = strategies[attempt] || strategies[strategies.length - 1];
          const scaledViewport = page.getViewport({ scale, rotation });

          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          // Clear canvas before render
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Create render task manually for better control
          const renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport } as never);

          // Wrap with timeout
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => {
              try {
                renderTask.cancel();
              } catch {}
              reject(new Error("timeout"));
            }, 10000)
          );

          await Promise.race([renderTask.promise, timeoutPromise]);
          setRendered(true);
          return; // Success!
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          const msg = lastError.message;

          // Canvas conflict - wait and retry
          if (msg.includes("same canvas") || msg.includes("multiple render")) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }

          // Other errors - try next strategy
          if (attempt < strategies.length - 1) continue;

          // Out of strategies
          throw lastError;
        }
      }

      throw lastError || new Error("Render failed");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Render failed";
      if (msg.includes("font") || msg.includes("Font")) {
        setError("Custom fonts");
      } else if (msg.includes("encoding") || msg.includes("Encoding")) {
        setError("Unsupported encoding");
      } else if (msg.includes("timeout")) {
        setError("Page too complex");
      } else if (msg.includes("same canvas")) {
        setError("Render conflict");
      } else if (msg.includes("Worker")) {
        setError("PDF.js worker error");
      } else if (msg.includes("InvalidPDF")) {
        setError("Invalid PDF structure");
      } else {
        setError(msg.slice(0, 30));
      }
    } finally {
      setLoading(false);
    }
  }, [file, pageNumber, rotation]);

  useEffect(() => {
    let cancelled = false;
    const doRender = async () => {
      if (cancelled) return;
      await render();
    };
    doRender();
    return () => {
      cancelled = true;
    };
  }, [render]);

  if (error) {
    return (
      <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-amber-50 to-orange-50">
        <AlertCircle className="h-6 w-6 text-amber-600 mb-1" />
        <span className="text-xs font-medium text-amber-900">Page {pageNumber}</span>
        <span className="text-[10px] text-amber-700 mt-0.5 leading-tight">{error}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {loading && !rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn("max-w-full max-h-full shadow-sm", !rendered && "opacity-0")}
      />
    </div>
  );
}

function PageModal({
  file,
  pageNumber,
  totalPages,
  onClose,
  onPrev,
  onNext,
  rotation,
}: {
  file: File;
  pageNumber: number;
  totalPages: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  rotation: number;
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-white text-sm">
            Page {pageNumber} of {totalPages} • {zoom === 1 ? "Fit" : `${Math.round(zoom * 100)}%`}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              -
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setZoom(1)}>
              Fit
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              +
            </Button>
            <Button size="icon" variant="secondary" onClick={onPrev} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={onNext} disabled={pageNumber >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg p-4 overflow-auto flex items-start justify-center">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            <PageThumbnail
              file={file}
              pageNumber={pageNumber}
              rotation={rotation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
