"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/lib/utils";

type SizeTier = "default" | "large" | "huge";

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
  title?: string;
  recommendedMB?: number;
  warningThresholdMB?: number;
}

export function PdfUploader({
  files,
  onFilesChange,
  multiple = false,
  accept,
  maxSizeMB = 25,
  title,
  recommendedMB = 25,
  warningThresholdMB = 50,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setError(null);
      setLoading(true);
      try {
        for (const file of accepted) {
          if (file.size === 0) {
            setError(`"${file.name}" is empty (0 bytes)`);
            setLoading(false);
            return;
          }
          const sizeMB = file.size / 1024 / 1024;
          if (sizeMB > maxSizeMB) {
            setError(`"${file.name}" is ${sizeMB.toFixed(1)}MB — exceeds ${maxSizeMB}MB limit. Try compressing it first or splitting into smaller files.`);
            setLoading(false);
            return;
          }
          if (accept && Object.keys(accept).some((k) => k.includes("pdf"))) {
            const buffer = await file.slice(0, 5).arrayBuffer();
            const header = new TextDecoder().decode(buffer);
            if (!header.startsWith("%PDF-")) {
              setError(`"${file.name}" doesn't look like a valid PDF file`);
              setLoading(false);
              return;
            }
          }
        }
        await new Promise((r) => setTimeout(r, 100));
        const next = multiple ? [...files, ...accepted] : accepted;
        onFilesChange(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to process files");
      } finally {
        setLoading(false);
      }
    },
    [files, multiple, onFilesChange, accept, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: accept ?? { "application/pdf": [".pdf"] },
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const remove = (idx: number) => {
    onFilesChange(files.filter((_, i) => i !== idx));
  };

  const showWarning = maxSizeMB > warningThresholdMB;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        {loading ? (
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
        ) : (
          <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
        )}
        <p className="mt-3 font-medium">
          {title || (isDragActive ? "Drop files here" : "Drag & drop files, or click to select")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Max {maxSizeMB}MB per file
        </p>
        {recommendedMB < maxSizeMB && (
          <p className="mt-1 text-xs text-muted-foreground">
            💡 Recommended: keep under {recommendedMB}MB for best performance
          </p>
        )}
        <p className="mt-3 text-xs text-green-600 inline-flex items-center gap-1">
          🔒 100% Private — files processed in your browser
        </p>
      </div>

      {showWarning && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Large files ({warningThresholdMB}MB+) may take longer to process and use more memory.
            For best experience, keep files under {recommendedMB}MB or compress first.
          </span>
        </div>
      )}

      {error && <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => {
            const sizeMB = f.size / 1024 / 1024;
            const isLarge = sizeMB > warningThresholdMB;
            return (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-md border bg-card",
                isLarge && "border-amber-300"
              )}>
                <FileText className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isLarge ? "text-amber-600" : "text-primary"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className={cn(
                    "text-xs",
                    isLarge ? "text-amber-700 font-medium" : "text-muted-foreground"
                  )}>
                    {formatBytes(f.size)}
                    {isLarge && " • Large file"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
