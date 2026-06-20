import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/merge" className="hover:text-primary">Merge PDF</Link></li>
              <li><Link href="/tools/split" className="hover:text-primary">Split PDF</Link></li>
              <li><Link href="/tools/compress" className="hover:text-primary">Compress PDF</Link></li>
              <li><Link href="/tools/convert" className="hover:text-primary">Convert PDF</Link></li>
              <li><Link href="/tools/rotate" className="hover:text-primary">Rotate PDF</Link></li>
              <li><Link href="/tools/watermark" className="hover:text-primary">Watermark PDF</Link></li>
              <li><Link href="/tools/flipbook" className="hover:text-primary">PDF to Flipbook</Link></li>
              <li><Link href="/tools/remove-pages" className="hover:text-primary">Remove Pages</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy#cookies" className="hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} PDFlytool. Made with ❤️ for everyone who needs free PDF tools.
        </div>
      </div>
    </footer>
  );
}
