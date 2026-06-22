export const metadata = {
  title: "Privacy Policy",
  description: "How PDFlytool handles your data and privacy.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: January 2025</p>

      <h2>1. Introduction</h2>
      <p>
        PDFlytool (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Files</h3>
      <p>
        <strong>We do not collect, store, or transmit your files.</strong> All PDF processing happens locally in your browser using JavaScript. Your files never leave your device.
      </p>

      <h3>2.2 Analytics</h3>
      <p>
        We use Google Analytics to understand how visitors use our website. This includes anonymized data such as:
      </p>
      <ul>
        <li>Pages visited</li>
        <li>Time spent on page</li>
        <li>Browser type and device</li>
        <li>Country/region (from IP, anonymized)</li>
      </ul>

      <h3>2.3 Cookies</h3>
      <p id="cookies">
        We use cookies and similar technologies for:
      </p>
      <ul>
        <li><strong>Essential cookies:</strong> Remember your cookie consent choice</li>
        <li><strong>Analytics cookies:</strong> Help us understand usage patterns (Google Analytics)</li>
        <li><strong>Advertising cookies:</strong> Google AdSense displays relevant ads</li>
      </ul>

      <h2>3. Advertising</h2>
      <p>
        We use Google AdSense, a third-party advertising service provided by Google. AdSense uses cookies and similar technologies to:
      </p>
      <ul>
        <li>Serve ads based on your prior visits to our site or other sites</li>
        <li>Measure ad effectiveness and engagement</li>
        <li>Provide personalized advertising (if you have not opted out)</li>
      </ul>
      <p>
        You may opt out of personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also opt out of certain third-party vendors&apos; use of cookies by visiting{" "}
        <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
      </p>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to our website. Users may opt out of the use of the DART cookie by visiting the{" "}
        <a href="https://www.google.com/policies/privacy/ads/" target="_blank" rel="noopener noreferrer">Google Ad and Content Network privacy policy</a>.
      </p>

      <h2>4. Data We Do Not Collect</h2>
      <ul>
        <li>Your PDF files or document contents</li>
        <li>Personal information (name, email, address)</li>
        <li>Payment information (we have no paid services)</li>
        <li>Account credentials (we have no accounts)</li>
      </ul>

      <h2>5. Third-Party Services</h2>
      <ul>
        <li><strong>Google Analytics:</strong> Website analytics</li>
        <li><strong>Google AdSense:</strong> Advertising</li>
        <li><strong>Vercel:</strong> Website hosting</li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Reject non-essential cookies via our cookie banner</li>
        <li>Opt out of personalized ads via Google Ads Settings</li>
        <li>Use the site without JavaScript-based features disabled (some tools may not work)</li>
      </ul>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        Our service is not directed to children under 13. We do not knowingly collect information from children.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on this page with an updated revision date.
      </p>

      <h2>9. Contact</h2>
      <p>
        For privacy questions, contact us at the email listed on our <a href="/contact">Contact</a> page.
      </p>
    </div>
  );
}
