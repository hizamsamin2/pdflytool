"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Scissors, ArrowRight, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { downloadBlob, getFileNameWithoutExt } from "@/lib/utils";
import { splitPdf } from "@/lib/pdf/merge";
import { PdfPreview } from "@/components/pdf-preview";
import { AdSlot } from "@/components/ad-slot";

export default function SplitPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [ranges, setRanges] = useState<string>("1-1");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ blob: Blob; name: string; range: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setResults([]);
  };

  const parseRanges = (): { from: number; to: number }[] => {
    return ranges
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => {
        if (r.includes("-")) {
          const [a, b] = r.split("-").map((n) => parseInt(n.trim()));
          return { from: a, to: b };
        }
        const n = parseInt(r);
        return { from: n, to: n };
      });
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF");
      return;
    }
    const parsed = parseRanges();
    if (parsed.length === 0) {
      setError("Please enter valid page ranges");
      return;
    }
    setProcessing(true);
    setError(null);
    setResults([]);
    try {
      const blobs = await splitPdf(files[0], ranges);
      const baseName = getFileNameWithoutExt(files[0].name);
      setResults(blobs.map((b, i) => ({
        blob: b,
        name: `${baseName}-part-${i + 1}.pdf`,
        range: parsed[i] ? `${parsed[i].from}-${parsed[i].to}` : ""
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed");
    } finally {
      setProcessing(false);
    }
  };

  const parsedRanges = parseRanges();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Scissors className="h-7 w-7 text-purple-600" />
              Split PDF
            </h1>
            <p className="text-muted-foreground mt-1">
              Split PDF into multiple files. Click pages to add them to a custom range.
            </p>
          </header>

          <PdfUploader
            files={files}
            onFilesChange={handleFilesChange}
            maxSizeMB={50}
            recommendedMB={20}
            warningThresholdMB={30}
          />

          {files.length > 0 && (
            <div className="mt-6">
              <PdfPreview
                file={files[0]}
                mode="view"
              />
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium">Page ranges</label>
              <input
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g., 1-3, 5, 7-9"
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Examples: <code className="bg-muted px-1 rounded">1-5</code>, <code className="bg-muted px-1 rounded">1-3, 5-7</code>, <code className="bg-muted px-1 rounded">2, 4, 6</code></p>
                <p>Click any page above to jump to it.</p>
              </div>

              {parsedRanges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {parsedRanges.map((r, i) => (
                    <div key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      Part {i + 1}: pages {r.from}-{r.to}
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleSplit} disabled={processing} className="w-full" size="lg">
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Splitting...</>
                ) : (
                  <>Split into {parsedRanges.length || 0} file(s) <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}

          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {results.length > 0 && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-3">
              <p className="font-medium text-center">✓ Split complete! ({results.length} files)</p>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <Button
                    key={i}
                    onClick={() => downloadBlob(r.blob, r.name)}
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Part {i + 1} (pages {r.range})
                    </span>
                    <Download className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside><AdSlot slot="1138897822" format="rectangle" className="h-64" /></aside>
      </div>
    </div>
  );
}
