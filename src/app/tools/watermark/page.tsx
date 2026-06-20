"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Droplet, ArrowRight } from "lucide-react";
import { downloadBlob, getFileNameWithoutExt } from "@/lib/utils";
import { addWatermark } from "@/lib/pdf/sign";
import { PdfPreview } from "@/components/pdf-preview";
import { AdSlot } from "@/components/ad-slot";
import { DonatePrompt } from "@/components/donate-prompt";

export default function WatermarkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [color, setColor] = useState<"gray" | "red" | "blue" | "black">("gray");
  const [applyTo, setApplyTo] = useState<"all" | "single">("all");
  const [targetPage, setTargetPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setResultBlob(null);
  };

  const handleAdd = async () => {
    if (files.length === 0 || !text) return;
    setProcessing(true);
    setError(null);
    setResultBlob(null);
    try {
      const blob = await addWatermark(files[0], {
        text,
        fontSize,
        opacity,
        rotation,
        color,
        page: applyTo === "single" ? targetPage : undefined,
      });
      setResultBlob(blob);
      setSuccessCount((c) => c + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Watermark failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Droplet className="h-7 w-7 text-cyan-600" />
              Add Watermark
            </h1>
            <p className="text-muted-foreground mt-1">
              Live preview shows your watermark before applying. Adjust sliders to fine-tune.
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
            <>
              <div className="mt-6 space-y-4 rounded-lg border bg-card p-4">
                <div>
                  <label className="text-sm font-medium">Watermark text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., CONFIDENTIAL, DRAFT, COPY"
                    className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Font size: {fontSize}px</label>
                    <input type="range" min="20" max="100" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Opacity: {Math.round(opacity * 100)}%</label>
                    <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rotation: {rotation}°</label>
                    <input type="range" min="-90" max="90" value={rotation} onChange={(e) => setRotation(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <select value={color} onChange={(e) => setColor(e.target.value as never)} className="mt-1 w-full px-3 py-2 border rounded-md bg-background">
                      <option value="gray">Gray</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Apply to</label>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setApplyTo("all")} className={`flex-1 px-3 py-2 border rounded-md text-sm ${applyTo === "all" ? "border-primary bg-primary/5 text-primary" : ""}`}>
                      All pages
                    </button>
                    <button onClick={() => setApplyTo("single")} className={`flex-1 px-3 py-2 border rounded-md text-sm ${applyTo === "single" ? "border-primary bg-primary/5 text-primary" : ""}`}>
                      Single page
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium">Live Preview</h2>
                  <span className="text-xs text-muted-foreground">Updates as you adjust settings</span>
                </div>
                <PdfPreview
                  file={files[0]}
                  mode="view"
                  rotation={0}
                />
                {applyTo === "single" && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    💡 Only page {targetPage} will get the watermark. Adjust settings then click "Add Watermark".
                  </p>
                )}
              </div>
            </>
          )}

          {files.length > 0 && (
            <Button onClick={handleAdd} disabled={processing} className="w-full mt-6" size="lg">
              {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : <>Add Watermark <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          )}

          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {resultBlob && files[0] && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-3">
              <p className="font-medium text-center">✓ Watermark added!</p>
              <Button onClick={() => downloadBlob(resultBlob, `${getFileNameWithoutExt(files[0].name)}-watermarked.pdf`)} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )}
        </div>

        <aside><AdSlot slot="1138897822" format="rectangle" className="h-64" /></aside>
      </div>
      <DonatePrompt trigger={successCount} />
    </div>
  );
}
