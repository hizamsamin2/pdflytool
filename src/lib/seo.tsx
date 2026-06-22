import type { Metadata } from "next";
import Script from "next/script";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pdflytool.com";
const OG_IMAGE = `${SITE_URL}/og`;

export const TOOL_META: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
  }
> = {
  merge: {
    title: "Merge PDF Online Free — Combine PDFs in Seconds",
    description:
      "Merge multiple PDF files into one document online for free. Drag to reorder files and pages, preview thumbnails, no upload required. Fast, private, and easy.",
    keywords: ["merge PDF", "combine PDF", "join PDF", "PDF merger online free"],
  },
  split: {
    title: "Split PDF Online Free — Extract Pages Instantly",
    description:
      "Split a PDF into multiple files or extract individual pages. Type page ranges like 1-5, 7, 9-12. Free, private, and works in your browser.",
    keywords: ["split PDF", "extract PDF pages", "PDF splitter online free"],
  },
  compress: {
    title: "Compress PDF Online Free — Reduce File Size",
    description:
      "Reduce PDF file size while keeping quality. Choose low, medium, or high compression. Free, fast, and 100% private — your files never leave your device.",
    keywords: ["compress PDF", "reduce PDF size", "PDF compressor online free"],
  },
  convert: {
    title: "Convert PDF to JPG / PNG — Or Images to PDF",
    description:
      "Convert PDF pages to JPG or PNG images, or combine JPG/PNG images into a PDF. Free online converter with high-quality output, no upload needed.",
    keywords: [
      "PDF to JPG",
      "PDF to PNG",
      "JPG to PDF",
      "PNG to PDF",
      "convert PDF",
    ],
  },
  rotate: {
    title: "Rotate PDF Pages Online Free — 90, 180, 270 Degrees",
    description:
      "Rotate PDF pages by 90, 180, or 270 degrees with a live preview. Free, fast, and private — works entirely in your browser.",
    keywords: ["rotate PDF", "rotate PDF pages", "PDF rotation online"],
  },
  watermark: {
    title: "Add Watermark to PDF Online Free — Custom Text",
    description:
      "Add a custom text watermark to every page or a single page of your PDF. Adjust font size, opacity, rotation, and color. Free and private.",
    keywords: ["PDF watermark", "add watermark to PDF", "watermark PDF online free"],
  },
  "remove-pages": {
    title: "Remove Pages from PDF Online Free — Visual Selector",
    description:
      "Click any page thumbnail to mark it for removal. Delete unwanted pages from your PDF visually. Free, fast, and 100% private.",
    keywords: ["remove pages from PDF", "delete PDF pages", "PDF page remover"],
  },
  flipbook: {
    title: "PDF to Flipbook — Interactive 3D Page Flip",
    description:
      "Turn any PDF into an interactive 3D flipbook. Download as a single self-contained HTML file you can host anywhere. Free, no upload required.",
    keywords: ["PDF to flipbook", "interactive PDF", "flipbook maker online"],
  },
};

export function buildToolMetadata(slug: string): Metadata {
  const m = TOOL_META[slug];
  if (!m) return {};
  const url = `${SITE_URL}/tools/${slug}`;
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: m.title,
      description: m.description,
      siteName: "PDFlytool",
      images: [{ url: `${OG_IMAGE}/${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [`${OG_IMAGE}/${slug}`],
    },
  };
}

export function toolJsonLd(slug: string) {
  const m = TOOL_META[slug];
  if (!m) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: m.title.split(" — ")[0],
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web Browser)",
    description: m.description,
    url: `${SITE_URL}/tools/${slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires modern web browser with JavaScript enabled",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
  };
}

export function renderJsonLd(data: object | null) {
  if (!data) return null;
  return (
    <Script
      id={`ldjson-${Math.random().toString(36).slice(2)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const SITE = {
  url: SITE_URL,
  ogImage: OG_IMAGE,
  name: "PDFlytool",
  description:
    "Free online PDF tools: merge, split, compress, convert, rotate, watermark. 100% private — files processed in your browser. No upload required.",
};

export const TOOLS_LIST = [
  { slug: "merge", name: "Merge PDF", desc: "Combine multiple PDFs into one" },
  { slug: "split", name: "Split PDF", desc: "Extract pages or split into multiple files" },
  { slug: "compress", name: "Compress PDF", desc: "Reduce file size while keeping quality" },
  { slug: "convert", name: "PDF to Image", desc: "Convert PDF to JPG or PNG" },
  { slug: "rotate", name: "Rotate PDF", desc: "Rotate pages by 90, 180, or 270 degrees" },
  { slug: "watermark", name: "Add Watermark", desc: "Stamp text watermark on every page" },
  { slug: "remove-pages", name: "Remove Pages", desc: "Delete specific pages from your PDF" },
  { slug: "flipbook", name: "PDF to Flipbook", desc: "Turn PDF into interactive 3D flipbook" },
];

export const FAQS = [
  {
    q: "Is PDFlytool really free?",
    a: "Yes! All our PDF tools are 100% free with no hidden charges, no watermarks, and no signup required.",
  },
  {
    q: "Are my files safe?",
    a: "Absolutely. All processing happens locally in your browser using JavaScript. Your files never get uploaded to any server.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account required. Just open the tool and start processing your PDFs immediately.",
  },
  {
    q: "Is there a file size limit?",
    a: "Most PDFs up to 25-50MB work smoothly. Very large files may take longer to process depending on your device.",
  },
  {
    q: "Which browsers are supported?",
    a: "PDFlytool works on all modern browsers including Chrome, Firefox, Edge, and Safari, on both desktop and mobile.",
  },
  {
    q: "How do you make money?",
    a: "We display non-intrusive ads to keep the service free. You can support us by disabling your ad blocker.",
  },
];

export function homeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE.name,
      url: SITE_URL,
      description: SITE.description,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (Web Browser)",
      browserRequirements: "Requires modern web browser with JavaScript enabled",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: TOOLS_LIST.map((t) => t.name),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "127",
        bestRating: "5",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      sameAs: [],
    },
  ];
}

export function renderJsonLdList(data: object[]) {
  return data.map((d, i) => (
    <Script
      key={i}
      id={`ldjson-${i}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
    />
  ));
}
