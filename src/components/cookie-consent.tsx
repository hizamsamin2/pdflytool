"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-xl border bg-background shadow-2xl p-4">
      <div className="flex items-start gap-3">
        <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm">We use cookies</p>
          <p className="text-xs text-muted-foreground mt-1">
            We use cookies and similar technologies for ads and analytics. By clicking "Accept", you consent to our use of cookies.{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={accept}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90"
            >
              Accept
            </button>
            <button
              onClick={reject}
              className="px-3 py-1.5 border rounded-md text-xs font-medium hover:bg-accent"
            >
              Reject
            </button>
          </div>
        </div>
        <button onClick={reject} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
