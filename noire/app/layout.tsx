import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight } from "next/font/google";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { site } from "@/content/site";
import "@/styles/tokens.css";
import "@/styles/base.css";

/* Display face + utility face — the only two families in the system. */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const utility = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.seo.title, template: `%s — ${site.name}` },
  description: site.seo.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#11110f",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${utility.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteNav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
