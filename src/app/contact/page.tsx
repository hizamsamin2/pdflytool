import { Mail, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the PDFlytool team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@pdflytool.com";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold">Contact Us</h1>
      <p className="mt-4 text-muted-foreground">
        Have questions, feedback, or feature requests? We&apos;d love to hear from you.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={`mailto:${email}`}
          className="rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/50 transition"
        >
          <Mail className="h-8 w-8 text-primary" />
          <h3 className="font-semibold mt-3">Email</h3>
          <p className="text-sm text-muted-foreground mt-1">{email}</p>
          <p className="text-xs text-muted-foreground mt-2">We reply within 24 hours</p>
        </a>
        <a
          href={`mailto:${email}?subject=Feedback`}
          className="rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/50 transition"
        >
          <MessageSquare className="h-8 w-8 text-primary" />
          <h3 className="font-semibold mt-3">Feedback</h3>
          <p className="text-sm text-muted-foreground mt-1">Help us improve PDFlytool</p>
          <p className="text-xs text-muted-foreground mt-2">Send your suggestions</p>
        </a>
      </div>

      <div className="mt-12 rounded-xl bg-muted p-6">
        <h2 className="font-semibold">Common Topics</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Feature requests for new PDF tools</li>
          <li>• Bug reports with steps to reproduce</li>
          <li>• Privacy questions</li>
          <li>• Business inquiries</li>
          <li>• Advertising & partnerships</li>
        </ul>
      </div>
    </div>
  );
}
