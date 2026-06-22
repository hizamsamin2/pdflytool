import type { Metadata } from "next";
import {
  buildToolMetadata,
  toolJsonLd,
  renderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildToolMetadata("remove-pages");

export default function RemovePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {renderJsonLd(toolJsonLd("remove-pages"))}
      {children}
    </>
  );
}
