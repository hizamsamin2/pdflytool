# PDFly — Free PDF Tools

Free online PDF tools. 100% private, 100% free. All processing happens in your browser.

## Features

- Merge PDF
- Split PDF
- Compress PDF
- Convert PDF ↔ JPG/PNG
- Rotate PDF
- Remove pages
- Add watermark
- Privacy-first (no uploads)

## Why PDFly?

- **Fast** — No upload/download from servers
- **Private** — Files never leave your browser
- **Free** — All tools, no paywalls, no signup
- **Smart limits** — Realistic file size limits for best performance
- **Mobile-friendly** — Works on all devices

## Monetization

PDFly is supported by:

1. **Google AdSense** — Non-intrusive ads on all pages
2. **Donations** — Buy Me a Coffee, PayPal (see `/donate`)

We never charge for features, add watermarks, or hide functionality behind paywalls.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Edit `.env.local` with your real values:

- `NEXT_PUBLIC_SITE_URL` — your production domain (e.g. `https://pdflytool.com`)
- `NEXT_PUBLIC_ADSENSE_ID` — your AdSense Publisher ID (e.g. `ca-pub-xxxxxxxxxxxxxxxx`)
- `NEXT_PUBLIC_GA_ID` — your GA4 Measurement ID (e.g. `G-XXXXXXXXXX`)
- `NEXT_PUBLIC_CONTACT_EMAIL` — email shown on the contact page

Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Set environment variables (see `.env.example`)
4. Deploy

## Monetization Setup

### Google AdSense
1. Apply at https://www.google.com/adsense
2. Get your Publisher ID (`ca-pub-xxx`)
3. Create ad units and get Slot IDs
4. Update `.env`:
   ```
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-xxxxx
   ```
5. Replace placeholder slot IDs in components (e.g., `slot="1234567890"`) with your real ad unit slot IDs
6. Update `public/ads.txt` with your publisher ID

### Buy Me a Coffee (Donations)
1. Sign up at https://www.buymeacoffee.com
2. Choose username
3. Update links in `src/app/donate/page.tsx`

### Google Analytics
1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (`G-XXXXXXX`)
3. Update `.env`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXX
   ```

## Domain Suggestions

- `pdflytool.com` (recommended)
- `pdflytool.io`
- `pdflytool.app`

## SEO Strategy

Target keywords:
- "merge PDF", "compress PDF online", "free PDF tools"
- "PDF tools no upload", "private PDF tools", "PDF tools browser"
- Long-tail: "merge PDF without uploading", "compress PDF safely"

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- pdf-lib (PDF processing)
- pdfjs-dist (PDF preview)
- Google AdSense (monetization)
- Google Analytics (tracking)

## License

MIT
