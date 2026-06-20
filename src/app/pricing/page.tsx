import { Check } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";

export const metadata = {
  title: "Pricing",
  description: "PDFlytool is 100% free — learn how we keep it that way.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Simple Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          PDFlytool is <strong>100% free</strong> for everyone. No premium plans, no hidden fees, no paywalls.
        </p>
      </div>

      <div className="mt-12 max-w-2xl mx-auto rounded-2xl border-2 border-primary bg-card p-8">
        <div className="flex items-baseline gap-2 justify-center">
          <span className="text-5xl font-bold text-primary">$0</span>
          <span className="text-xl text-muted-foreground">/ forever</span>
        </div>
        <p className="text-center text-muted-foreground mt-2">All features. No limits. No signup.</p>

        <ul className="mt-8 space-y-3 max-w-md mx-auto">
          {[
            "Merge unlimited PDFs",
            "Split PDFs into multiple files",
            "Compress PDFs to reduce size",
            "Convert PDF to JPG/PNG and back",
            "Rotate PDF pages",
            "Add watermarks to PDFs",
            "Remove pages from PDFs",
            "No watermarks on output",
            "Smart file size limits (25-50MB)",
            "Works offline after first load",
            "Mobile-friendly",
            "Privacy-first (no uploads)",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <section className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center">How We Keep It Free</h2>
        <div className="mt-6 rounded-xl bg-muted p-6 space-y-4">
          <p>
            PDFlytool is supported by <strong>non-intrusive advertising</strong>. We display ads from Google AdSense,
            which are clearly marked and never interfere with the PDF tools themselves.
          </p>
          <p>
            We chose ads over premium plans because we believe essential PDF tools should be free for everyone,
            regardless of their budget.
          </p>
          <p>
            <strong>Support us</strong> by disabling your ad blocker on PDFlytool, or consider{" "}
            <a href="/contact" className="text-primary underline">contacting us</a> about sponsorship opportunities.
          </p>
        </div>
      </section>

      <div className="mt-12">
        <AdSlot slot="4567890123" format="rectangle" className="h-64" />
      </div>

      <section className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="mt-6 space-y-3">
          {[
            { q: "Will PDFlytool always be free?", a: "Yes. Our mission is to provide free PDF tools. As long as advertising covers our costs, we will keep all features free." },
            { q: "Are there any premium features I can pay for?", a: "No. We do not offer premium plans. All features are free for everyone." },
            { q: "Why do you show ads?", a: "Ads help us pay for hosting, development, and maintenance. They allow us to keep all features free without charging users." },
            { q: "Can I pay to remove ads?", a: "Currently no, but you can use an ad blocker to hide them. Note that ad blockers may affect some site functionality." },
            { q: "How can I support PDFlytool?", a: "The best way to support us is to share PDFlytool with friends, leave positive reviews, or donate via the Donate page." },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border bg-card p-4">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
