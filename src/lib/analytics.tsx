import { Metadata } from "next";

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export function AnalyticsHead() {
  if (!adsenseId || adsenseId.includes("xxxxxxxx")) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
    />
  );
}

export function GoogleAnalytics() {
  if (!gaId || gaId.includes("XXXX")) return null;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  );
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "PDFlytool — Free PDF Tools Online",
    template: "%s | PDFlytool",
  },
  description:
    "Free online PDF tools: merge, split, compress, convert, rotate, watermark. 100% private — files processed in your browser. No upload required.",
  keywords: [
    "PDF tools",
    "merge PDF",
    "compress PDF",
    "split PDF",
    "PDF to JPG",
    "JPG to PDF",
    "rotate PDF",
    "watermark PDF",
    "online PDF",
    "free PDF tools",
    "PDFlytool",
  ],
  authors: [{ name: "PDFlytool" }],
  creator: "PDFlytool",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PDFlytool — Free PDF Tools Online",
    description: "Free online PDF tools. Private, fast, and easy to use.",
    siteName: "PDFlytool",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFlytool — Free PDF Tools",
    description: "Free online PDF tools. Private, fast, and easy to use.",
  },
  robots: { index: true, follow: true },
};
