import { AdSlot } from "@/components/ad-slot";
import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Learn about PDFlytool — a free, privacy-first PDF tools platform.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">About PDFlytool</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We believe essential PDF tools should be free, private, and accessible to everyone.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-muted-foreground">
            PDFlytool was created to solve a simple problem: most online PDF tools require you to upload sensitive
            documents to unknown servers. We built PDFlytool so that all processing happens directly in your browser —
            meaning your files never leave your device.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Why Free?</h2>
          <p className="mt-3 text-muted-foreground">
            PDF manipulation is a basic utility everyone needs. We think it should be free. To keep PDFlytool free,
            we display ads (which you can dismiss easily). We never charge for core features, add watermarks, or
            hide functionality behind paywalls.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Technology</h2>
          <p className="mt-3 text-muted-foreground">
            PDFlytool is built using modern web technologies including Next.js, TypeScript, pdf-lib, and PDF.js. All PDF
            processing happens client-side using JavaScript — no backend is involved for file handling.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="mt-3 text-muted-foreground">
            Have feedback or suggestions? We&apos;d love to hear from you.{" "}
            <Link href="/contact" className="text-primary underline">Get in touch</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <AdSlot slot="1138897822" format="rectangle" className="h-64" />
      </div>
    </div>
  );
}
