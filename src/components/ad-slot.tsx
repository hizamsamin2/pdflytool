"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  className?: string;
}

export function AdSlot({ slot, format = "auto", className = "" }: Props) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const isPlaceholder = !adsenseId || adsenseId.includes("xxxxxxxx");
  const insRef = useRef<HTMLModElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (isPlaceholder || !adsenseId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
    const t = setTimeout(() => {
      const el = insRef.current;
      if (!el) return;
      const dataAdHeight =
        el.getAttribute("data-adsbygoogle-status") !== null
          ? el.offsetHeight
          : 0;
      setFilled(el.offsetHeight > 0 || dataAdHeight > 0);
    }, 2500);
    return () => clearTimeout(t);
  }, [isPlaceholder, adsenseId]);

  if (isPlaceholder) {
    return (
      <div className={`ad-slot ${className}`}>
        <span>Ad Space — Configure NEXT_PUBLIC_ADSENSE_ID</span>
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`}
      style={{ display: filled ? "block" : "none" }}
      data-ad-client={adsenseId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
