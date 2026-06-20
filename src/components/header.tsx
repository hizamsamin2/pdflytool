"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, X } from "lucide-react";
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
          <Image src="/logo.svg" alt="PDFlytool" width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">PDFlytool</span>
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
          <Link href="/about" className="px-3 py-2 text-sm hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="px-3 py-2 text-sm hover:text-primary">
            Contact
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
          </div>
        </nav>
      )}
    </header>
  );
}
