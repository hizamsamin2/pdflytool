"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, Merge, ArrowRight, FileText, Trash2 } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { mergePdfs, type MergeItem } from "@/lib/pdf/merge";
import { AdSlot, useAdsConfigured } from "@/components/ad-slot";
import { PdfPreview } from "@/components/pdf-preview";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MergeFileState {
  id: string;
  file: File;
  pageCount: number;
  pageOrder: number[];
  hasError: boolean;
  errorMessage: string;
}

export default function MergePage() {
  const adsConfigured = useAdsConfigured();
  const [files, setFiles] = useState<MergeFileState[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectingPages, setDetectingPages] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  const handleFilesChange = async (newFiles: File[]) => {
    setError(null);
    setResultBlob(null);
    setDetectingPages(true);
    const states: MergeFileState[] = [];
    const errors: string[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const state: MergeFileState = {
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        file,
        pageCount: 0,
        pageOrder: [],
        hasError: false,
        errorMessage: "",
      };

      try {
        const buffer = await file.arrayBuffer();
        const header = new TextDecoder().decode(new Uint8Array(buffer.slice(0, 5)));
        if (!header.startsWith("%PDF-")) {
          state.hasError = true;
          state.errorMessage = "Not a valid PDF file";
          errors.push(`"${file.name}" is not a valid PDF file`);
          states.push(state);
          continue;
        }

        const { loadPdfSafely } = await import("@/lib/pdf/merge");
        const pdf = await loadPdfSafely(file);
        const count = pdf.getPageCount();
        state.pageCount = count;
        state.pageOrder = Array.from({ length: count }, (_, j) => j + 1);
        states.push(state);
      } catch (e) {
        state.hasError = true;
        const msg = e instanceof Error ? e.message : "unknown error";
        state.errorMessage = msg.replace(`"${file.name}" `, "").replace(`"${file.name}"`, "");
        errors.push(`"${file.name}": ${msg}`);
        states.push(state);
      }
    }

    setFiles(states);
    setDetectingPages(false);

    if (errors.length > 0) {
      const validCount = states.filter((s) => !s.hasError).length;
      if (validCount === 0) {
        setError(
          `None of the ${newFiles.length} file(s) could be read. ${errors[0]} ` +
          `Tip: Repair tools at ilovepdf.com/repair-pdf or smallpdf.com/repair-pdf can fix most issues.`
        );
      } else {
        setError(
          `${validCount} of ${newFiles.length} file(s) loaded. Skipped: ${errors.join("; ")} ` +
          `You can proceed with the valid files, or try a PDF repair tool.`
        );
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultBlob(null);
  };

  const moveFile = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= files.length) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setResultBlob(null);
  };

  const moveFileUp = (idx: number) => moveFile(idx, -1);
  const moveFileDown = (idx: number) => moveFile(idx, 1);

  const totalPages = files.reduce((sum, f) => sum + f.pageOrder.length, 0);
  const validFiles = files.filter((f) => !f.hasError);
  const validTotalPages = validFiles.reduce((sum, f) => sum + f.pageOrder.length, 0);

  const handleMerge = async () => {
    if (validFiles.length < 2) {
      setError("Please add at least 2 valid PDF files");
      return;
    }
    setProcessing(true);
    setError(null);
    setResultBlob(null);
    setProgress(20);
    try {
      const items: MergeItem[] = validFiles.map((f) => ({ file: f.file, pageOrder: f.pageOrder }));
      const blob = await mergePdfs(items);
      setProgress(100);
      setResultBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={
        adsConfigured
          ? "mx-auto max-w-5xl px-4 py-8"
          : "mx-auto max-w-3xl px-4 py-8"
      }
    >
      <div
        className={
          adsConfigured
            ? "grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8"
            : ""
        }
      >
        <div>
          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Merge className="h-7 w-7 text-blue-600" />
              Merge PDF
            </h1>
            <p className="text-muted-foreground mt-1">
              Combine PDFs and reorder pages visually. Drag to rearrange files.
            </p>
          </header>

          <PdfUploader
            files={files.map((f) => f.file)}
            onFilesChange={handleFilesChange}
            multiple
            maxSizeMB={25}
            recommendedMB={10}
            warningThresholdMB={15}
          />

          {detectingPages && (
            <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading PDFs...
            </div>
          )}

          {files.length >= 1 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {validFiles.length} of {files.length} valid • {validTotalPages} pages total
                  {files.length > validFiles.length && (
                    <span className="text-destructive ml-2">
                      ({files.length - validFiles.length} skipped)
                    </span>
                  )}
                </p>
                {validFiles.length >= 2 && (
                  <p className="text-xs text-muted-foreground">↑↓ to reorder</p>
                )}
              </div>

              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div
                    key={f.id}
                    className={`rounded-lg border ${
                      f.hasError ? "border-destructive/50 bg-destructive/5 opacity-75" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => moveFileUp(idx)}
                          disabled={idx === 0 || f.hasError}
                          className="px-2 py-0.5 hover:bg-muted rounded text-xs disabled:opacity-30"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveFileDown(idx)}
                          disabled={idx === files.length - 1 || f.hasError}
                          className="px-2 py-0.5 hover:bg-muted rounded text-xs disabled:opacity-30"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <FileText className={`h-8 w-8 flex-shrink-0 ${f.hasError ? "text-destructive" : "text-blue-600"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate flex items-center gap-2">
                          {f.file.name}
                          {f.hasError && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                              SKIPPED
                            </span>
                          )}
                        </p>
                        <p className={`text-xs ${f.hasError ? "text-destructive" : "text-muted-foreground"}`}>
                          {f.hasError
                            ? f.errorMessage || "Could not read this file"
                            : `${formatBytes(f.file.size)} • ${f.pageCount} pages`}
                        </p>
                      </div>
                      {!f.hasError && f.pageCount > 0 && (
                        <button
                          onClick={() => setExpandedFileId(expandedFileId === f.id ? null : f.id)}
                          className="p-2 hover:bg-muted rounded"
                          title={expandedFileId === f.id ? "Hide preview" : "Show preview"}
                        >
                          {expandedFileId === f.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(f.id)}
                        className="p-2 hover:bg-destructive/10 rounded text-destructive"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {expandedFileId === f.id && !f.hasError && (
                      <div className="border-t p-3 bg-muted/30">
                        <PdfPreview file={f.file} mode="view" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {validFiles.length >= 2 && (
            <Button onClick={handleMerge} disabled={processing} className="w-full mt-6" size="lg">
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Merging...</>
              ) : (
                <>Merge {validFiles.length} files ({validTotalPages} pages) <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}

          {processing && <div className="mt-4"><Progress value={progress} /></div>}
          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {resultBlob && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-3">
              <p className="font-medium text-center">✓ Merge complete!</p>
              <p className="text-sm text-center text-muted-foreground">{formatBytes(resultBlob.size)}</p>
              <Button onClick={() => downloadBlob(resultBlob, "merged.pdf")} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" /> Download merged.pdf
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <AdSlot slot="1138897822" format="rectangle" className="h-64" />
        </aside>
      </div>
    </div>
  );
}
