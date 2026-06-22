"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

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

const AdsConfiguredContext = createContext<boolean | null>(null);

export function AdsConfiguredProvider({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const configured = !!(adsenseId && !adsenseId.includes("xxxxxxxx"));
  return (
    <AdsConfiguredContext.Provider value={configured}>
      {children}
    </AdsConfiguredContext.Provider>
  );
}

export function useAdsConfigured(): boolean {
  const ctx = useContext(AdsConfiguredContext);
  if (ctx === null) {
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
    return !!(adsenseId && !adsenseId.includes("xxxxxxxx"));
  }
  return ctx;
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
    return null;
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
