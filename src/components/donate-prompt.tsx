"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useState, useEffect } from "react";

export function DonatePrompt({ trigger }: { trigger?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const dismissed = sessionStorage.getItem("donate-prompt-dismissed");
    const counter = parseInt(sessionStorage.getItem("tool-uses") || "0") + 1;
    sessionStorage.setItem("tool-uses", String(counter));

    // Show after 3rd successful tool use in this session, if not dismissed
    if (counter === 3 && !dismissed) {
      setVisible(true);
    }
  }, [trigger]);

  const dismiss = () => {
    sessionStorage.setItem("donate-prompt-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 rounded-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 shadow-xl p-4">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <Heart className="h-6 w-6 text-pink-500 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <p className="font-semibold text-sm">PDFly helped you? ☕</p>
          <p className="text-xs text-muted-foreground mt-1">
            We&apos;re 100% free. If you found this useful, a small donation helps keep us running.
          </p>
          <div className="flex gap-2 mt-3">
            <Link
              href="/donate"
              onClick={dismiss}
              className="px-3 py-1.5 bg-pink-500 text-white rounded-md text-xs font-medium hover:bg-pink-600"
            >
              Support Us
            </Link>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 border border-pink-300 text-pink-700 rounded-md text-xs font-medium hover:bg-pink-50"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
