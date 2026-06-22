import type { Metadata } from "next";
import {
  buildToolMetadata,
  toolJsonLd,
  renderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildToolMetadata("split");

export default function SplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {renderJsonLd(toolJsonLd("split"))}
      {children}
    </>
  );
}
