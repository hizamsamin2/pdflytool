import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const toBlob = (bytes: Uint8Array, type: string): Blob => {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return new Blob([ab], { type });
};

export interface SignOptions {
  signatureDataUrl: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  reason?: string;
  name?: string;
}

export async function addSignatureToPdf(file: File, opts: SignOptions): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();
  const pageIndex = opts.page - 1;
  if (pageIndex < 0 || pageIndex >= pages.length) throw new Error("Page does not exist");

  const page = pages[pageIndex];
  const { height: pageHeight } = page.getSize();

  const base64 = opts.signatureDataUrl.replace(/^data:image\/png;base64,/, "");
  const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const pngImage = await pdf.embedPng(pngBytes);

  const ratio = pngImage.width / pngImage.height;
  let drawW = opts.width;
  let drawH = opts.width / ratio;
  if (drawH > opts.height) {
    drawH = opts.height;
    drawW = opts.height * ratio;
  }

  const yFromTop = pageHeight - opts.y - drawH;
  page.drawImage(pngImage, { x: opts.x, y: yFromTop, width: drawW, height: drawH });

  if (opts.name) {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const labelY = yFromTop - 12;
    if (labelY > 0) {
      page.drawText(`Signed by: ${opts.name}`, {
        x: opts.x,
        y: labelY,
        size: 8,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  return toBlob(await pdf.save(), "application/pdf");
}

export interface WatermarkOptions {
  text: string;
  page?: number;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  color?: "gray" | "red" | "blue" | "black";
}

export async function addWatermark(file: File, opts: WatermarkOptions): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const colorMap = {
    gray: rgb(0.7, 0.7, 0.7),
    red: rgb(0.9, 0.2, 0.2),
    blue: rgb(0.2, 0.4, 0.9),
    black: rgb(0, 0, 0),
  };

  const pages = pdf.getPages();
  const targetPages = opts.page ? [pages[opts.page - 1]] : pages;

  for (const page of targetPages) {
    if (!page) continue;
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize || 48);
    const x = (width - textWidth) / 2;
    const y = height / 2;

    page.drawText(opts.text, {
      x,
      y,
      size: opts.fontSize || 48,
      font,
      color: colorMap[opts.color || "gray"],
      opacity: opts.opacity ?? 0.3,
      rotate: { type: "degrees", angle: opts.rotation ?? -45 } as never,
    });
  }

  return toBlob(await pdf.save(), "application/pdf");
}
