"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Loader2,
  BookOpen,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  downloadBlob,
  formatBytes,
  getFileNameWithoutExt,
} from "@/lib/utils";
import { pdfToFlipbook, buildStandaloneHtml, type Flipbook } from "@/lib/pdf/flipbook";
import { AdSlot } from "@/components/ad-slot";

const FlipbookViewer = dynamic(
  () => import("@/components/flipbook-viewer").then((m) => m.FlipbookViewer),
  { ssr: false, loading: () => <div className="text-sm text-muted-foreground p-4">Loading viewer...</div> }
);

const MAX_PAGES = 150;

export default function FlipbookPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flipbook, setFlipbook] = useState<Flipbook | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setFlipbook(null);
    setProgress(0);

    try {
      const file = files[0];
      const result = await pdfToFlipbook(file, (p) => {
        setProgress(Math.round((p.current / p.total) * 100));
      });
      setFlipbook(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadHtml = async () => {
    if (!flipbook) return;
    try {
      const title = files[0]
        ? getFileNameWithoutExt(files[0].name)
        : "flipbook";
      const blob = await buildStandaloneHtml(flipbook, title);
      downloadBlob(blob, `${title}-flipbook.html`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build HTML");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setFlipbook(null);
    setProgress(0);
    setError(null);
  };

  if (files[0] && flipbook) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Your Flipbook
            </h1>
            <p className="text-sm text-muted-foreground">
              {flipbook.pageCount} pages · {formatBytes(estimateSize(flipbook))} estimated
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New PDF
            </Button>
            <Button onClick={handleDownloadHtml}>
              <Download className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
          </div>
        </div>

        <FlipbookViewer flipbook={flipbook} />

        <div className="mt-8 rounded-xl border bg-muted/40 p-6">
          <h3 className="font-semibold mb-2">Share your flipbook</h3>
          <p className="text-sm text-muted-foreground mb-3">
            The downloaded HTML file is fully self-contained — all pages, images, and the viewer are embedded. Upload it to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              <strong>Netlify Drop</strong> (drop the file at{" "}
              <code className="text-xs bg-background px-1 rounded">app.netlify.com/drop</code>) for an instant public URL
            </li>
            <li>
              <strong>GitHub Pages</strong>, <strong>Vercel</strong>, or any static host
            </li>
            <li>
              <strong>Google Drive</strong>, Dropbox, OneDrive — share as attachment
            </li>
            <li>Send as email attachment — recipients can open it offline</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">PDF to Flipbook</h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Turn any PDF into an interactive 3D flipbook. Download as a single
          self-contained HTML file you can host anywhere — Google Drive, Dropbox,
          GitHub Pages, or email.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <PdfUploader
          files={files}
          onFilesChange={setFiles}
          multiple={false}
          accept={{ "application/pdf": [".pdf"] }}
        />

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 text-destructive p-3 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rendering pages...
                  </span>
                  <span className="tabular-nums">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {!processing && (
              <Button onClick={handleGenerate} size="lg" className="w-full">
                Generate Flipbook
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Maximum {MAX_PAGES} pages. Larger PDFs work but may be slow.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-1">100% Private</div>
          <p className="text-muted-foreground">
            Pages are rendered in your browser. Nothing is uploaded.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-1">Self-Contained HTML</div>
          <p className="text-muted-foreground">
            One file, fully portable. Open it anywhere, even offline.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-1">Search & Bookmarks</div>
          <p className="text-muted-foreground">
            Find text across pages and jump via the PDF table of contents.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <AdSlot slot="1138897822" format="horizontal" className="h-24" />
      </div>
    </div>
  );
}

function estimateSize(flipbook: Flipbook): number {
  return flipbook.pages.reduce((sum, p) => sum + p.imageDataUrl.length, 0);
}