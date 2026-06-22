import type { Metadata } from "next";
import {
  buildToolMetadata,
  toolJsonLd,
  renderJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildToolMetadata("merge");

export default function MergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {renderJsonLd(toolJsonLd("merge"))}
      {children}
    </>
  );
}
