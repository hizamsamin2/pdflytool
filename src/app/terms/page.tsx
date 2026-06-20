export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using PDFly.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-gray max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: January 2025</p>

      <h2>1. Acceptance</h2>
      <p>
        By accessing PDFly, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
      </p>

      <h2>2. Service Description</h2>
      <p>
        PDFly provides free online PDF tools. All processing happens in your browser. The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You agree NOT to use PDFly to:</p>
      <ul>
        <li>Process files containing illegal content</li>
        <li>Violate any laws or third-party rights</li>
        <li>Attempt to disrupt or hack the service</li>
        <li>Use automated systems to abuse the service</li>
        <li>Reverse-engineer or copy our code</li>
      </ul>

      <h2>4. No Warranty</h2>
      <p>
        We do our best to keep PDFly working correctly, but we cannot guarantee the service will be uninterrupted, error-free, or produce specific results. Use at your own risk.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        PDFly shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. We are not responsible for lost data or files.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        The PDFly website, design, and code are owned by us. You retain all rights to your own files and content.
      </p>

      <h2>7. Modifications</h2>
      <p>
        We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may discontinue the service at any time without notice.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These terms shall be governed by applicable international laws.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms? <a href="/contact">Contact us</a>.
      </p>
    </div>
  );
}
