"use client";

import { useState } from "react";
import { PdfUploader } from "@/components/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText, ArrowRight } from "lucide-react";
import { downloadBlob, getFileNameWithoutExt } from "@/lib/utils";
import { removePages } from "@/lib/pdf/merge";
import { PdfPreview } from "@/components/pdf-preview";
import { AdSlot, useAdsConfigured, useAdsFilled } from "@/components/ad-slot";

export default function RemovePagesPage() {
  const adsConfigured = useAdsConfigured();
  const adsFilled = useAdsFilled();
  const showSidebar = adsConfigured && adsFilled;
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setSelectedPages(new Set());
    setResultBlob(null);
  };

  const handleRemove = async () => {
    if (files.length === 0 || selectedPages.size === 0) {
      setError("Please select at least one page to remove");
      return;
    }
    setProcessing(true);
    setError(null);
    setResultBlob(null);
    try {
      const blob = await removePages(files[0], Array.from(selectedPages));
      setResultBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Removal failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={
        showSidebar
          ? "mx-auto max-w-5xl px-4 py-8"
          : "mx-auto max-w-3xl px-4 py-8"
      }
    >
      <div
        className={
          showSidebar
            ? "grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8"
            : ""
        }
      >
        <div>
          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7 text-red-600" />
              Remove Pages
            </h1>
            <p className="text-muted-foreground mt-1">
              Click on pages to mark them for removal. Visual preview shows exactly what you&apos;re deleting.
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
                mode="remove"
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
              />
            </div>
          )}

          {files.length > 0 && selectedPages.size > 0 && (
            <Button onClick={handleRemove} disabled={processing} className="w-full mt-6" size="lg">
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Removing...</>
              ) : (
                <>Remove {selectedPages.size} page(s) <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}

          {error && <div className="mt-4 rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

          {resultBlob && files[0] && (
            <div className="mt-6 rounded-lg border-2 border-primary bg-card p-6 space-y-3">
              <p className="font-medium text-center">✓ Pages removed successfully!</p>
              <Button onClick={() => downloadBlob(resultBlob, `${getFileNameWithoutExt(files[0].name)}-trimmed.pdf`)} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )}
        </div>

        {showSidebar && (
          <aside><AdSlot slot="1138897822" format="rectangle" className="h-64" /></aside>
        )}
      </div>
    </div>
  );
}
