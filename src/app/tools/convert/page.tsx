"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, ArrowRight, FileImage } from "lucide-react";
import { downloadBlob, formatBytes, getFileNameWithoutExt } from "@/lib/utils";
import { pdfToImages, imagesToPdf } from "@/lib/pdf/convert";
import { AdSlot, useAdsConfigured } from "@/components/ad-slot";

type Direction = "pdf-to-jpg" | "pdf-to-png" | "jpg-to-pdf" | "png-to-pdf";

export default function ConvertPage() {
  const adsConfigured = useAdsConfigured();
  const [files, setFiles] = useState<File[]>([]);
  const [direction, setDirection] = useState<Direction>("pdf-to-jpg");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const file = files[0];
      const baseName = getFileNameWithoutExt(file.name);

      if (direction.startsWith("pdf-to")) {
        const images = await pdfToImages(file, direction === "pdf-to-png" ? "png" : "jpeg");
        setProgress(50);

        if (images.length === 1) {
          setResult({
            blob: images[0],
            filename: `${baseName}.${direction === "pdf-to-png" ? "png" : "jpg"}`,
          });
        } else {
          const JSZip = (await import("jszip")).default;
          const zip = new JSZip();
          images.forEach((img, i) => {
            const ext = direction === "pdf-to-png" ? "png" : "jpg";
            zip.file(`${baseName}-page-${i + 1}.${ext}`, img);
          });
          const zipBlob = await zip.generateAsync({ type: "blob" });
          setResult({ blob: zipBlob, filename: `${baseName}-images.zip` });
        }
      } else {
        const blob = await imagesToPdf(files);
        setProgress(50);
        setResult({ blob, filename: `${baseName}.pdf` });
      }
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
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
              <FileImage className="h-7 w-7 text-primary" />
              Convert PDF
            </h1>
            <p className="text-muted-foreground mt-1">Convert PDF to JPG/PNG or images to PDF</p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {[
              { v: "pdf-to-jpg", label: "PDF → JPG" },
              { v: "pdf-to-png", label: "PDF → PNG" },
              { v: "jpg-to-pdf", label: "JPG → PDF" },
              { v: "png-to-pdf", label: "PNG → PDF" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => {
                  setDirection(opt.v as Direction);
                  setFiles([]);
                  setResult(null);
                }}
                className={`px-3 py-2 border rounded-lg text-sm font-medium transition ${
                  direction === opt.v ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <PdfUploader
            files={files}
            onFilesChange={setFiles}
            multiple={direction.includes("to-pdf")}
            maxSizeMB={direction.includes("pdf-to") ? 30 : 10}
            recommendedMB={direction.includes("pdf-to") ? 15 : 5}
            warningThresholdMB={direction.includes("pdf-to") ? 20 : 8}
            accept={
              direction.includes("pdf-to")
                ? { "application/pdf": [".pdf"] }
                : direction === "jpg-to-pdf"
                ? { "image/jpeg": [".jpg", ".jpeg"] }
                : { "image/png": [".png"] }
            }
          />

          {files.length > 0 && (
            <Button onClick={handleConvert} disabled={processing} className="w-full mt-6" size="lg">
              {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Converting...</> : <>Convert Now <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          )}

          {processing && <div className="mt-4"><Progress value={progress} /></div>}
          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {result && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-3">
              <p className="font-medium text-center">✓ Conversion complete!</p>
              <p className="text-sm text-center text-muted-foreground">{result.filename} ({formatBytes(result.blob.size)})</p>
              <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <AdSlot slot="1138897822" format="rectangle" className="h-64" />
          <AdSlot slot="1138897822" format="vertical" className="h-64" />
        </aside>
      </div>
    </div>
  );
}
