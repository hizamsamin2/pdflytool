import { ImageResponse } from "next/og";
import { TOOL_META, TOOLS_LIST, SITE } from "@/lib/seo";

export const runtime = "edge";

const TOOL_SLUGS = new Set(TOOLS_LIST.map((t) => t.slug));

function pickMeta(slug: string) {
  if (slug === "home") {
    return {
      title: SITE.name,
      subtitle: "Free PDF Tools Online",
      desc: "Merge, split, compress, convert, rotate & watermark — 100% private.",
    };
  }
  if (TOOL_SLUGS.has(slug)) {
    const m = TOOL_META[slug];
    return {
      title: m.title.split(" — ")[0],
      subtitle: m.title.split(" — ")[1] || "Free Online Tool",
      desc: m.description.split(".")[0] + ".",
    };
  }
  return {
    title: "PDFlytool",
    subtitle: "Free PDF Tools",
    desc: "All your PDF needs in one place.",
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { title, subtitle, desc } = pickMeta(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)",
          padding: "60px",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "32px",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            📄
          </div>
          <div>PDFlytool</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 600,
              opacity: 0.9,
              marginTop: "12px",
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              fontSize: "24px",
              opacity: 0.8,
              marginTop: "24px",
              maxWidth: "900px",
            }}
          >
            {desc}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "60px",
            fontSize: "22px",
            opacity: 0.85,
          }}
        >
          100% Free • 100% Private • No Upload
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
