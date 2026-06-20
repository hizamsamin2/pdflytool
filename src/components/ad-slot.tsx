"use client";

import { useEffect } from "react";

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

  useEffect(() => {
    if (isPlaceholder || !adsenseId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
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
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={adsenseId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
