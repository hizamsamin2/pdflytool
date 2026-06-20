import Link from "next/link";
import {
  FileText, Merge, Minimize2, Shield, Zap,
  FileImage, RotateCw, Droplet, Scissors, ArrowRight, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ad-slot";

export default function HomePage() {
  const tools = [
    { icon: Merge, title: "Merge PDF", desc: "Combine multiple PDFs into one", href: "/tools/merge", color: "text-blue-600" },
    { icon: Scissors, title: "Split PDF", desc: "Extract pages or split into multiple files", href: "/tools/split", color: "text-purple-600" },
    { icon: Minimize2, title: "Compress PDF", desc: "Reduce file size while keeping quality", href: "/tools/compress", color: "text-green-600" },
    { icon: FileImage, title: "PDF to Image", desc: "Convert PDF to JPG or PNG", href: "/tools/convert", color: "text-orange-600" },
    { icon: RotateCw, title: "Rotate PDF", desc: "Rotate pages by 90, 180, or 270 degrees", href: "/tools/rotate", color: "text-pink-600" },
    { icon: Droplet, title: "Add Watermark", desc: "Stamp text watermark on every page", href: "/tools/watermark", color: "text-cyan-600" },
    { icon: FileText, title: "Remove Pages", desc: "Delete specific pages from your PDF", href: "/tools/remove-pages", color: "text-red-600" },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700 mb-6">
          <Shield className="h-3 w-3" /> 100% Private — Files never leave your device
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          PDF Tools That<br />
          <span className="text-primary">Just Work</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Merge, split, compress, convert, rotate, watermark PDFs — all in your browser. No upload, no signup, no limits.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="lg">
            <Link href="/tools/merge">
              Start Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#tools">View All Tools</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <AdSlot slot="1234567890" format="horizontal" className="h-24" />
      </section>

      <section id="tools" className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">All PDF Tools</h2>
          <p className="mt-2 text-muted-foreground">Choose a tool to get started — all are free</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map(({ icon: Icon, title, desc, href, color }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border bg-card p-5 hover:shadow-lg hover:border-primary/50 transition"
            >
              <Icon className={`h-8 w-8 mb-3 ${color} group-hover:scale-110 transition`} />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-6 text-center">
            <Shield className="h-10 w-10 text-green-600 mx-auto" />
            <h3 className="font-semibold mt-3">100% Private</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All processing happens in your browser. Your files are never uploaded to any server.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <Zap className="h-10 w-10 text-yellow-600 mx-auto" />
            <h3 className="font-semibold mt-3">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No upload/download from servers. Process files instantly on your device.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <FileText className="h-10 w-10 text-primary mx-auto" />
            <h3 className="font-semibold mt-3">Always Free</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All tools are 100% free. No hidden fees, no premium plans, no watermarks.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <AdSlot slot="2345678901" format="rectangle" className="h-64" />
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-pink-100 to-orange-50 border border-pink-200 p-8 md:p-12 text-center">
          <Heart className="h-10 w-10 text-pink-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Love PDFlytool?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            PDFlytool is free for everyone, with no paywalls or premium plans.
            If it saved you time today, consider supporting the project with a small donation — it helps us pay for hosting and keep building new tools.
          </p>
          <Button asChild size="lg" className="mt-6 bg-pink-500 hover:bg-pink-600">
            <Link href="/donate">
              <Heart className="h-4 w-4 mr-2" />
              Support the Project
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">One-time or monthly • From $3 • Multiple payment methods</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload File", desc: "Drag & drop your PDF or select from your device. Nothing leaves your browser." },
              { step: "2", title: "Process", desc: "Our tools process your file instantly using browser-native JavaScript." },
              { step: "3", title: "Download", desc: "Get your processed file immediately. No waiting, no watermarks." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto">
                  {s.step}
                </div>
                <h3 className="font-semibold mt-4">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {[
            { q: "Is PDFlytool really free?", a: "Yes! All our PDF tools are 100% free with no hidden charges, no watermarks, and no signup required." },
            { q: "Are my files safe?", a: "Absolutely. All processing happens locally in your browser using JavaScript. Your files never get uploaded to any server." },
            { q: "Do I need to create an account?", a: "No account required. Just open the tool and start processing your PDFs immediately." },
            { q: "Is there a file size limit?", a: "Most PDFs up to 25-50MB work smoothly. Very large files may take longer to process depending on your device." },
            { q: "Which browsers are supported?", a: "PDFlytool works on all modern browsers including Chrome, Firefox, Edge, and Safari, on both desktop and mobile." },
            { q: "How do you make money?", a: "We display non-intrusive ads to keep the service free. You can support us by disabling your ad blocker." },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border bg-card p-4">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
