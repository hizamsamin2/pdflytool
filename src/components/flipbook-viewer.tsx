"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Maximize2,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flipbook, FlipbookOutlineItem } from "@/lib/pdf/flipbook";
import { searchFlipbook } from "@/lib/pdf/flipbook";

interface FlipbookViewerProps {
  flipbook: Flipbook;
}

export function FlipbookViewer({ flipbook }: FlipbookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<any>(null);
  const [pageIndicator, setPageIndicator] = useState("1 / " + flipbook.pageCount);
  const [showSearch, setShowSearch] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { pageNumber: number; snippet: string }[]
  >([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!containerRef.current || flipbook.pages.length === 0) return;

    let mounted = true;
    let flipInstance: any = null;

    (async () => {
      const PageFlipMod = await import("page-flip");
      const PageFlip = (PageFlipMod as any).PageFlip || (PageFlipMod as any).default?.PageFlip || (PageFlipMod as any).default;
      if (!PageFlip) {
        console.error("[flipbook] PageFlip class not found in module", Object.keys(PageFlipMod));
        return;
      }
      if (!mounted || !containerRef.current) return;

      const first = flipbook.pages[0];
      const aspectRatio = first.height / first.width;
      const targetWidth = Math.min(800, (containerRef.current.parentElement?.clientWidth || window.innerWidth) - 40);
      const targetHeight = targetWidth * aspectRatio;

      const preloadImages = (urls: string[]): Promise<void[]> => {
        return Promise.all(
          urls.map(
            (url) =>
              new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = url;
              })
          )
        );
      };

      await preloadImages(flipbook.pages.map((p) => p.imageDataUrl));
      if (!mounted || !containerRef.current) return;

      console.log("[flipbook] init", {
        pages: flipbook.pages.length,
        firstW: first.width,
        firstH: first.height,
        targetWidth,
        targetHeight,
        containerW: containerRef.current.offsetWidth,
        containerH: containerRef.current.offsetHeight,
      });

      flipInstance = new PageFlip(containerRef.current, {
        width: targetWidth,
        height: targetHeight,
        size: "fixed",
        minWidth: targetWidth,
        maxWidth: targetWidth,
        minHeight: targetHeight,
        maxHeight: targetHeight,
        showCover: false,
        mobileScrollSupport: true,
        flippingTime: 600,
        usePortrait: true,
        startZIndex: 0,
        autoSize: false,
        maxShadowOpacity: 0.5,
        drawShadow: true,
        useMouseEvents: true,
      });

      flipRef.current = flipInstance;

      await flipInstance.loadFromImages(flipbook.pages.map((p) => p.imageDataUrl));

      flipInstance.on("flip", (e: any) => {
        const pageNum = e.data + 1;
        setPageIndicator(pageNum + " / " + flipbook.pageCount);
      });

      const handleResize = () => {
        if (flipRef.current) flipRef.current.update();
      };
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    })();

    return () => {
      mounted = false;
      if (flipInstance) {
        try {
          flipInstance.destroy();
        } catch {}
      }
    };
  }, [flipbook]);

  const flipNext = () => flipRef.current?.flipNext();
  const flipPrev = () => flipRef.current?.flipPrev();
  const goToPage = (page: number) => {
    flipRef.current?.flip(page - 1);
    setShowSearch(false);
    setShowOutline(false);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchFlipbook(flipbook, q);
    setSearchResults(results);
    setSearching(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      )
        return;
      if (e.key === "ArrowLeft") flipPrev();
      else if (e.key === "ArrowRight") flipNext();
      else if (e.key.toLowerCase() === "s") setShowSearch((v) => !v);
      else if (e.key.toLowerCase() === "t") setShowOutline((v) => !v);
      else if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const outlineByLevel = flipbook.outline;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between gap-2 mb-3 px-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={flipPrev} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums px-2 min-w-[60px] text-center">
            {pageIndicator}
          </span>
          <Button variant="outline" size="sm" onClick={flipNext} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOutline((v) => !v)}
            disabled={flipbook.outline.length === 0}
            title="Table of contents (T)"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch((v) => !v)}
            title="Search (S)"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title="Fullscreen (F)"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white rounded-lg overflow-hidden mx-auto shadow-2xl"
        style={{ width: "100%", maxWidth: 1200, height: 600 }}
      />

      {showSearch && (
        <div className="absolute top-12 right-2 w-80 max-w-[calc(100vw-1rem)] bg-background border rounded-lg shadow-lg p-3 z-20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Search</span>
            <button
              onClick={() => setShowSearch(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search text..."
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <div className="mt-2 max-h-80 overflow-y-auto">
            {searching && (
              <div className="text-xs text-muted-foreground p-2">Searching...</div>
            )}
            {!searching && searchQuery && searchResults.length === 0 && (
              <div className="text-xs text-muted-foreground p-2">No results found.</div>
            )}
            {!searching && searchResults.map((r) => (
              <button
                key={r.pageNumber}
                onClick={() => goToPage(r.pageNumber)}
                className="block w-full text-left p-2 rounded hover:bg-accent text-sm"
              >
                <div className="text-xs text-muted-foreground">Page {r.pageNumber}</div>
                <div className="text-xs line-clamp-2 mt-0.5">{r.snippet}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showOutline && (
        <div className="absolute top-12 right-2 w-80 max-w-[calc(100vw-1rem)] bg-background border rounded-lg shadow-lg p-3 z-20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Table of Contents</span>
            <button
              onClick={() => setShowOutline(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {outlineByLevel.map((item, idx) => (
              <button
                key={idx}
                onClick={() => goToPage(item.pageNumber)}
                className="block w-full text-left p-2 rounded hover:bg-accent text-sm"
                style={{ paddingLeft: 8 + item.level * 12 }}
              >
                <div className="text-xs font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">Page {item.pageNumber}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-3 text-center">
        Use ← → to flip · S to search · T for contents · F for fullscreen
      </div>
    </div>
  );
}

function groupOutline(outline: FlipbookOutlineItem[]): FlipbookOutlineItem[] {
  return outline;
}