import type { Metadata } from "next";
import {
  buildToolMetadata,
  toolJsonLd,
  renderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildToolMetadata("watermark");

export default function WatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {renderJsonLd(toolJsonLd("watermark"))}
      {children}
    </>
  );
}
