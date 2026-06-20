import { Heart, Coffee, Github, DollarSign, Bitcoin, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";

export const metadata = {
  title: "Support PDFly — Keep PDF Tools Free",
  description: "Help keep PDFly free for everyone. Your support funds development, hosting, and improvements.",
};

const donationMethods = [
  {
    name: "Buy Me a Coffee",
    icon: Coffee,
    color: "bg-yellow-500 hover:bg-yellow-600",
    textColor: "text-yellow-600",
    url: "#",
    description: "One-time or monthly support starting at $3",
    fee: "0% platform fee",
    popular: true,
  },
  {
    name: "GitHub Sponsors",
    icon: Github,
    color: "bg-gray-900 hover:bg-gray-800",
    textColor: "text-gray-900 dark:text-gray-100",
    url: "#",
    description: "Monthly sponsorship starting at $5",
    fee: "0% platform fee",
  },
  {
    name: "PayPal",
    icon: DollarSign,
    color: "bg-blue-600 hover:bg-blue-700",
    textColor: "text-blue-600",
    url: "#",
    description: "One-time donation via PayPal",
    fee: "Standard PayPal fees",
  },
  {
    name: "Ko-fi",
    icon: Heart,
    color: "bg-pink-500 hover:bg-pink-600",
    textColor: "text-pink-600",
    url: "#",
    description: "One-time support with no fees",
    fee: "0% platform fee",
  },
];

const cryptoAddresses = [
  { name: "Bitcoin (BTC)", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", icon: Bitcoin },
  { name: "Ethereum (ETH)", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", icon: Zap },
  { name: "USDT (TRC20)", address: "TXyzABC123def456ghi789jkl012mno345pqr678stu", icon: DollarSign },
];

const supportTiers = [
  {
    name: "Coffee",
    price: "$3",
    icon: Coffee,
    perks: ["☕ Warm feeling in dev's heart", "❣️ Listed in credits (optional)"],
    color: "border-yellow-200 bg-yellow-50",
  },
  {
    name: "Supporter",
    price: "$10",
    icon: Heart,
    perks: ["All Coffee perks", "🎯 Priority bug fixes", "💬 Direct contact via email"],
    color: "border-pink-200 bg-pink-50",
    popular: true,
  },
  {
    name: "Champion",
    price: "$50",
    icon: Star,
    perks: ["All Supporter perks", "🚀 Vote on new features", "🏆 Logo on homepage (optional)"],
    color: "border-purple-200 bg-purple-50",
  },
];

export default function DonatePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold">Support PDFly</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          PDFly is <strong>free for everyone</strong> and always will be. If it saved you time, consider buying
          us a coffee — your support keeps the servers running and funds new features.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="text-center">
          <Users className="h-6 w-6 text-primary mx-auto" />
          <p className="text-2xl font-bold mt-2">10,000+</p>
          <p className="text-xs text-muted-foreground">users served</p>
        </div>
        <div className="text-center">
          <Zap className="h-6 w-6 text-primary mx-auto" />
          <p className="text-2xl font-bold mt-2">100%</p>
          <p className="text-xs text-muted-foreground">free, forever</p>
        </div>
        <div className="text-center">
          <Heart className="h-6 w-6 text-pink-500 mx-auto" />
          <p className="text-2xl font-bold mt-2">0 ads</p>
          <p className="text-xs text-muted-foreground">on core tools</p>
        </div>
      </div>

      {/* Why donate */}
      <section className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Why your support matters</h2>
        <div className="mt-6 space-y-3">
          {[
            { icon: "🖥️", title: "Server costs", desc: "Hosting, PDF.js CDN bandwidth, and SSL certificates" },
            { icon: "⚡", title: "Development time", desc: "Adding new features and fixing bugs takes hundreds of hours" },
            { icon: "🔒", title: "Privacy infrastructure", desc: "Keeping everything client-side means no cheap shortcuts" },
            { icon: "📚", title: "Free for everyone", desc: "Your support helps students, freelancers, and small businesses worldwide" },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 rounded-lg border bg-card">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation methods */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Choose your way to support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donationMethods.map((method) => {
            const Icon = method.icon;
            return (
              <a
                key={method.name}
                href={method.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative block rounded-xl border-2 p-6 hover:shadow-lg transition ${
                  method.popular ? "border-pink-300 ring-2 ring-pink-100" : "border-border"
                }`}
              >
                {method.popular && (
                  <span className="absolute -top-3 left-4 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                    MOST POPULAR
                  </span>
                )}
                <Icon className={`h-8 w-8 ${method.textColor}`} />
                <h3 className="font-semibold text-lg mt-3">{method.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                <p className="text-xs text-green-600 mt-2">✓ {method.fee}</p>
                <Button className={`w-full mt-4 ${method.color}`}>
                  Donate via {method.name} →
                </Button>
              </a>
            );
          })}
        </div>
      </section>

      {/* Tier comparison */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-center">Or pick a tier</h2>
        <p className="text-center text-muted-foreground mt-2 text-sm">One-time or monthly, your choice</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {supportTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative rounded-xl border-2 p-6 ${tier.color} ${
                  tier.popular ? "ring-2 ring-pink-300" : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-4 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                    BEST VALUE
                  </span>
                )}
                <Icon className="h-7 w-7" />
                <h3 className="font-bold text-xl mt-3">{tier.name}</h3>
                <p className="text-3xl font-bold mt-2">{tier.price}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {tier.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crypto */}
      <section className="mt-12 max-w-2xl mx-auto">
        <details className="rounded-lg border bg-card p-4">
          <summary className="font-medium cursor-pointer flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            Cryptocurrency donations
          </summary>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Crypto wallet addresses will be added soon. In the meantime, please use one of the
              donation methods above.
            </p>
            <p className="text-xs text-muted-foreground">
              ⚠️ Always verify addresses carefully before sending. Crypto transactions cannot be reversed.
            </p>
          </div>
        </details>
      </section>

      {/* Other ways */}
      <section className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Other ways to help</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: "⭐", title: "Star on GitHub", desc: "Show your appreciation with a star" },
            { icon: "🐦", title: "Share on social media", desc: "Tell your friends about PDFly" },
            { icon: "✍️", title: "Write a review", desc: "On Product Hunt or your blog" },
            { icon: "🐛", title: "Report bugs", desc: "Help us improve by reporting issues" },
            { icon: "🌐", title: "Translate", desc: "Help translate PDFly to your language" },
            { icon: "💡", title: "Suggest features", desc: "Tell us what tools you need next" },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 rounded-lg border bg-card">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transparency */}
      <section className="mt-12 max-w-2xl mx-auto">
        <div className="rounded-xl bg-muted p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Our promise
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>PDFly will always be free.</strong> No paywalls, no premium tiers, no "Pro" features locked behind subscriptions.
            Your donations go directly to hosting costs and development time — they don&apos;t unlock features.
          </p>
          <p className="text-sm text-muted-foreground">
            If PDFly helped you, the best gift is sharing it with someone who needs it. ❤️
          </p>
        </div>
      </section>

      <div className="mt-12">
        <AdSlot slot="6666666666" format="rectangle" className="h-64" />
      </div>

      {/* Final CTA */}
      <section className="mt-12 text-center max-w-xl mx-auto">
        <p className="text-lg">
          Even if you can&apos;t donate, thank you for using PDFly! 🙏
        </p>
        <Button asChild size="lg" variant="outline" className="mt-4">
          <Link href="/">← Back to Tools</Link>
        </Button>
      </section>
    </div>
  );
}
