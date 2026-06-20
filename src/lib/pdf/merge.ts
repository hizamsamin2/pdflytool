import { PDFDocument } from "pdf-lib";

const toBlob = (bytes: Uint8Array, type: string): Blob => {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return new Blob([ab], { type });
};

export async function loadPdfSafely(file: File, allowEncryption = true): Promise<PDFDocument> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength === 0) {
      throw new Error(`"${file.name}" is empty (0 bytes)`);
    }
    const header = new TextDecoder().decode(bytes.slice(0, 5));
    if (!header.startsWith("%PDF-")) {
      throw new Error(`"${file.name}" is not a valid PDF file (missing %PDF- header)`);
    }

    // Detect common problematic formats
    const headerBytes = new TextDecoder("latin1").decode(bytes.slice(0, 1024));
    if (headerBytes.includes("/Linearized")) {
      // Linearized PDFs sometimes have parsing issues — try anyway
    }
    if (headerBytes.includes("/JavaScript") || headerBytes.includes("/JS")) {
      // PDFs with JavaScript actions
    }

    try {
      return await PDFDocument.load(bytes, { ignoreEncryption: allowEncryption });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);

      if (errMsg.includes("encrypted")) {
        throw new Error(`"${file.name}" is password-protected. Please unlock it first (use ilovepdf.com/unlock_pdf)`);
      }
      if (errMsg.includes("PDFDict") || errMsg.includes("PDFArray") || errMsg.includes("instance of undefined")) {
        throw new Error(`"${file.name}" uses a complex PDF format (possibly PDF/A, PDF/X, or has JavaScript/actions). Try re-saving it with Adobe Reader or a PDF repair tool first.`);
      }
      if (errMsg.includes("trailer")) {
        throw new Error(`"${file.name}" has a damaged trailer section. The file may be incomplete or corrupted.`);
      }
      if (errMsg.includes("xref") || errMsg.includes("cross-reference")) {
        throw new Error(`"${file.name}" has a broken cross-reference table. Try re-saving or repairing the file.`);
      }
      if (errMsg.includes("stream") || errMsg.includes("Flate")) {
        throw new Error(`"${file.name}" uses unsupported compression. Try re-saving it.`);
      }

      throw new Error(`"${file.name}" is corrupted or unsupported: ${errMsg.slice(0, 100)}`);
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('"')) throw e;
    throw new Error(`Failed to read "${file.name}": ${e instanceof Error ? e.message : "unknown error"}`);
  }
}

export interface MergeItem {
  file: File;
  pageOrder?: number[];
}

export async function mergePdfs(items: MergeItem[]): Promise<Blob> {
  const merged = await PDFDocument.create();
  for (const item of items) {
    const src = await loadPdfSafely(item.file);
    const indices = item.pageOrder ?? src.getPageIndices();
    const validIndices = indices.filter((i) => i >= 0 && i < src.getPageCount());
    if (validIndices.length === 0) continue;
    const pages = await merged.copyPages(src, validIndices);
    pages.forEach((p) => merged.addPage(p));
  }
  return toBlob(await merged.save(), "application/pdf");
}

export async function splitPdf(file: File, ranges: string): Promise<Blob[]> {
  const pdf = await loadPdfSafely(file);
  const total = pdf.getPageCount();
  const rangeList = ranges.split(",").map((r) => r.trim());

  const results: Blob[] = [];
  for (const range of rangeList) {
    const [start, end] = range.includes("-")
      ? range.split("-").map((n) => parseInt(n.trim()))
      : [parseInt(range), parseInt(range)];
    const startIdx = Math.max(0, (start || 1) - 1);
    const endIdx = Math.min(total, end || total);

    const newDoc = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = startIdx; i < endIdx; i++) indices.push(i);
    const pages = await newDoc.copyPages(pdf, indices);
    pages.forEach((p) => newDoc.addPage(p));
    results.push(toBlob(await newDoc.save(), "application/pdf"));
  }
  return results;
}

export async function rotatePdf(file: File, degrees: number): Promise<Blob> {
  const pdf = await loadPdfSafely(file);
  for (const page of pdf.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation({ type: "degrees", angle: (current + degrees) % 360 } as never);
  }
  return toBlob(await pdf.save(), "application/pdf");
}

export async function removePages(file: File, pagesToRemove: number[]): Promise<Blob> {
  const pdf = await loadPdfSafely(file);
  const total = pdf.getPageCount();

  const indicesToKeep: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!pagesToRemove.includes(i + 1)) indicesToKeep.push(i);
  }

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(pdf, indicesToKeep);
  pages.forEach((p) => newDoc.addPage(p));
  return toBlob(await newDoc.save(), "application/pdf");
}
