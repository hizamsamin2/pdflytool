import { PDFDocument } from "pdf-lib";

const toBlob = (bytes: Uint8Array, type: string): Blob => {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return new Blob([ab], { type });
};

export async function compressPdf(file: File, level: "low" | "medium" | "high" = "medium"): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

  const options: { useObjectStreams: boolean; objectsPerTick?: number } = { useObjectStreams: true };
  if (level === "high") options.objectsPerTick = 50;
  if (level === "low") options.useObjectStreams = false;

  return toBlob(await pdf.save(options), "application/pdf");
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
}

export async function compressWithStats(file: File, level: "low" | "medium" | "high"): Promise<CompressionResult> {
  const original = file.size;
  const blob = await compressPdf(file, level);
  const compressed = blob.size;
  const savedPercent = original === 0 ? 0 : Math.round(((original - compressed) / original) * 100);
  return { blob, originalSize: original, compressedSize: compressed, savedPercent };
}
