"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, Minimize2, ArrowRight, TrendingDown } from "lucide-react";
import { downloadBlob, formatBytes, getFileNameWithoutExt } from "@/lib/utils";
import { compressWithStats } from "@/lib/pdf/compress";
import { AdSlot, useAdsConfigured } from "@/components/ad-slot";

type Level = "low" | "medium" | "high";

export default function CompressPage() {
  const adsConfigured = useAdsConfigured();
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<Level>("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string; saved: number; original: number; compressed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(40);
    try {
      const file = files[0];
      const { blob, originalSize, compressedSize, savedPercent } = await compressWithStats(file, level);
      setProgress(100);
      setResult({
        blob,
        filename: `${getFileNameWithoutExt(file.name)}-compressed.pdf`,
        saved: savedPercent,
        original: originalSize,
        compressed: compressedSize,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div
        className={
          adsConfigured
            ? "grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8"
            : "mx-auto max-w-3xl"
        }
      >
        <div>
          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Minimize2 className="h-7 w-7 text-green-600" />
              Compress PDF
            </h1>
            <p className="text-muted-foreground mt-1">Reduce PDF file size while maintaining quality</p>
          </header>

          <PdfUploader
            files={files}
            onFilesChange={(f) => { setFiles(f); setResult(null); }}
            maxSizeMB={50}
            recommendedMB={20}
            warningThresholdMB={30}
          />

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium">Compression level</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { v: "low", label: "Low", desc: "Best quality" },
                  { v: "medium", label: "Medium", desc: "Balanced" },
                  { v: "high", label: "High", desc: "Smallest size" },
                ] as { v: Level; label: string; desc: string }[]).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setLevel(opt.v)}
                    className={`px-3 py-3 border rounded-lg text-sm transition ${
                      level === opt.v ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <Button onClick={handleCompress} disabled={processing} className="w-full" size="lg">
                {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Compressing...</> : <>Compress Now <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          )}

          {processing && <div className="mt-4"><Progress value={progress} /></div>}
          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {result && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-4">
              <div className="text-center">
                <TrendingDown className="h-8 w-8 text-primary mx-auto" />
                <p className="font-bold text-2xl mt-2 text-primary">Saved {result.saved}%</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs">Original</p>
                  <p className="font-bold">{formatBytes(result.original)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-muted-foreground text-xs">New size</p>
                  <p className="font-bold text-primary">{formatBytes(result.compressed)}</p>
                </div>
              </div>
              <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" /> Download
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
