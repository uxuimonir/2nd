import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, IBM_Plex_Mono, Instrument_Serif, Schibsted_Grotesk, Tiro_Bangla } from "next/font/google";
import { Cursor } from "@/components/cursor/Cursor";
import { LOADER_SCRIPT, LoadingScreen } from "@/components/chrome/LoadingScreen";
import { TopBar } from "@/components/chrome/TopBar";
import { PlaceReveal } from "@/components/place/PlaceReveal";
import { ExperienceProvider } from "@/features/experience/ExperienceProvider";
import { buildPlaces } from "@/lib/places";
import { siteUrl } from "@/lib/utils";
import { getJourney } from "@/services/content";
import "@/styles/globals.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display-latin", display: "swap" });
const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans-latin", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-latin", display: "swap" });
const bnDisplay = Tiro_Bangla({ subsets: ["bengali"], weight: "400", variable: "--font-display-bn", display: "swap" });
const bnSans = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600"], variable: "--font-sans-bn", display: "swap" });

const DESCRIPTION = "An immersive interactive journey through the land, water, history and people of Bangladesh — from the river delta to the Sundarbans.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Digital Bangladesh — A Living Journey Through Land, Water, History & People", template: "%s — Digital Bangladesh" },
  description: DESCRIPTION,
  applicationName: "Digital Bangladesh",
  keywords: ["Bangladesh", "Sundarbans", "Padma", "Dhaka", "rivers", "heritage", "interactive map", "delta", "culture", "history"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Digital Bangladesh",
    title: "Digital Bangladesh — A Living Journey",
    description: DESCRIPTION,
    locale: "en_GB",
    alternateLocale: ["bn_BD"],
  },
  twitter: { card: "summary_large_image", title: "Digital Bangladesh — A Living Journey", description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#121110",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const journey = await getJourney();
  const places = buildPlaces(journey);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Digital Bangladesh",
    url: siteUrl(),
    description: DESCRIPTION,
    inLanguage: ["en", "bn"],
    potentialAction: { "@type": "SearchAction", target: `${siteUrl()}/search?q={query}`, "query-input": "required name=query" },
  };
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} ${bnDisplay.variable} ${bnSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOADER_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main" className="sr-only-focusable t-kicker fixed left-4 top-4 bg-paper px-4 py-3 text-ink" style={{ zIndex: 200 }}>
          Skip to content
        </a>
        <ExperienceProvider places={places}>
          <TopBar />
          {children}
          <PlaceReveal />
          <Cursor />
          <LoadingScreen />
        </ExperienceProvider>
      </body>
    </html>
  );
}
