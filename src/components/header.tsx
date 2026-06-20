"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, X, Heart, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const tools = [
  { href: "/tools/merge", label: "Merge" },
  { href: "/tools/split", label: "Split" },
  { href: "/tools/compress", label: "Compress" },
  { href: "/tools/convert", label: "Convert" },
  { href: "/tools/rotate", label: "Rotate" },
  { href: "/tools/watermark", label: "Watermark" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="PDFly" width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">PDFly</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <div className="relative group">
            <button className="px-3 py-2 text-sm hover:text-primary">Tools</button>
            <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border bg-background shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
              {tools.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="block px-4 py-2 text-sm hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/pricing" className="px-3 py-2 text-sm hover:text-primary">
            Pricing
          </Link>
          <Link href="/about" className="px-3 py-2 text-sm hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="px-3 py-2 text-sm hover:text-primary">
            Contact
          </Link>
          <Link
            href="/donate"
            className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-sm font-medium hover:bg-pink-100 transition border border-pink-200"
          >
            <Heart className="h-3.5 w-3.5" />
            Donate
          </Link>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t bg-background">
          <div className="mx-auto max-w-6xl px-4 py-2 space-y-1">
            {tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-3 py-2 text-sm rounded-md",
                  pathname === t.href ? "bg-primary/10 text-primary" : "hover:bg-accent"
                )}
              >
                {t.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
            >
              Contact
            </Link>
            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="mx-3 mt-2 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-pink-50 text-pink-600 text-sm font-medium border border-pink-200"
            >
              <Heart className="h-4 w-4" />
              Support Us
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
