"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

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

let adFilled = false;
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return adFilled;
}
function getServerSnapshot() {
  return false;
}
function setAdFilled(v: boolean) {
  if (adFilled === v) return;
  adFilled = v;
  listeners.forEach((cb) => cb());
}

function startWatching() {
  if (typeof window === "undefined") return;
  if ((startWatching as { started?: boolean }).started) return;
  (startWatching as { started?: boolean }).started = true;

  const checkFilled = (): boolean => {
    const ins = document.querySelector(
      "ins.adsbygoogle[data-adsbygoogle-status='filled']"
    ) as HTMLElement | null;
    if (ins && ins.offsetHeight > 0) return true;
    const tall = Array.from(
      document.querySelectorAll("ins.adsbygoogle")
    ) as HTMLElement[];
    return tall.some((el) => el.offsetHeight > 100);
  };

  if (checkFilled()) {
    setAdFilled(true);
    return;
  }

  const observer = new MutationObserver(() => {
    if (checkFilled()) {
      setAdFilled(true);
      observer.disconnect();
    }
  });
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-adsbygoogle-status", "style"],
    childList: true,
  });

  setTimeout(() => {
    if (checkFilled()) setAdFilled(true);
  }, 5000);
}

export function useAdsFilled(): boolean {
  const configured = useAdsConfigured();
  useEffect(() => {
    if (configured) startWatching();
  }, [configured]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function AdSlot({ slot, format = "auto", className = "" }: Props) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const isPlaceholder = !adsenseId || adsenseId.includes("xxxxxxxx");
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (isPlaceholder || !adsenseId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [isPlaceholder, adsenseId]);

  if (isPlaceholder) {
    return null;
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={adsenseId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
