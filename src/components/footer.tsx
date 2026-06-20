import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Support Banner */}
        <div className="mb-10 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 p-6 text-center">
          <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
          <h3 className="font-semibold text-lg">PDFlytool is free, forever</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl mx-auto">
            If our tools saved you time, consider supporting development with a small donation.
            Every coffee counts! ☕
          </p>
          <Link
            href="/donate"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition"
          >
            <Heart className="h-4 w-4" />
            Support PDFlytool
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/merge" className="hover:text-primary">Merge PDF</Link></li>
              <li><Link href="/tools/split" className="hover:text-primary">Split PDF</Link></li>
              <li><Link href="/tools/compress" className="hover:text-primary">Compress PDF</Link></li>
              <li><Link href="/tools/convert" className="hover:text-primary">Convert PDF</Link></li>
              <li><Link href="/tools/rotate" className="hover:text-primary">Rotate PDF</Link></li>
              <li><Link href="/tools/watermark" className="hover:text-primary">Watermark PDF</Link></li>
              <li><Link href="/tools/remove-pages" className="hover:text-primary">Remove Pages</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/donate" className="text-pink-600 font-medium hover:underline">❤️ Donate</Link></li>
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
          <div>
            <h3 className="font-semibold mb-3">Why PDFlytool?</h3>
            <p className="text-sm text-muted-foreground">
              Free, private, and easy to use. All processing happens in your browser — your files never leave your device.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} PDFlytool. Made with ❤️ for everyone who needs free PDF tools.
        </div>
      </div>
    </footer>
  );
}
