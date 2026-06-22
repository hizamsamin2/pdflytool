import type { Metadata } from "next";
import {
  buildToolMetadata,
  toolJsonLd,
  renderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildToolMetadata("convert");

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {renderJsonLd(toolJsonLd("convert"))}
      {children}
    </>
  );
}
