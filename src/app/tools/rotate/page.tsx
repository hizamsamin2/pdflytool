"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RotateCw, ArrowRight } from "lucide-react";
import { downloadBlob, getFileNameWithoutExt } from "@/lib/utils";
import { rotatePdf } from "@/lib/pdf/merge";
import { PdfPreview } from "@/components/pdf-preview";
import { AdSlot, useAdsConfigured } from "@/components/ad-slot";

export default function RotatePage() {
  const adsConfigured = useAdsConfigured();
  const [files, setFiles] = useState<File[]>([]);
  const [degrees, setDegrees] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setResultBlob(null);
  };

  const handleRotate = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setResultBlob(null);
    try {
      const blob = await rotatePdf(files[0], degrees);
      setResultBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotation failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
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
              <RotateCw className="h-7 w-7 text-pink-600" />
              Rotate PDF
            </h1>
            <p className="text-muted-foreground mt-1">
              Visual preview shows your rotation. Click any page for full-size view.
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
              <PdfPreview file={files[0]} mode="rotate" rotation={degrees} />
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium">Rotation angle</label>
              <div className="grid grid-cols-4 gap-2">
                {[90, 180, 270, 360].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDegrees(d)}
                    className={`px-4 py-3 border rounded-lg text-sm font-medium transition ${
                      degrees === d ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/50"
                    }`}
                  >
                    {d}°
                  </button>
                ))}
              </div>
              <Button onClick={handleRotate} disabled={processing} className="w-full" size="lg">
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Rotating...</>
                ) : (
                  <>Apply Rotation <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}

          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {resultBlob && files[0] && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-3">
              <p className="font-medium text-center">✓ Rotation applied!</p>
              <Button onClick={() => downloadBlob(resultBlob, `${getFileNameWithoutExt(files[0].name)}-rotated.pdf`)} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )}
        </div>

        <aside><AdSlot slot="1138897822" format="rectangle" className="h-64" /></aside>
      </div>
    </div>
  );
}
