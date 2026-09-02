import type { Metadata } from "next";
import { Source_Serif_4, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Chrome } from "@/components/Chrome";
import { ContactFooter } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thebasispoint.finance"),
  title: "The Basis Point",
  description:
    "The Basis Point — notes on rates, credit, and sovereign issuance by Nathalie Lustig.",
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "The Basis Point" }],
    },
  },
  openGraph: {
    title: "The Basis Point",
    description:
      "Notes on rates, credit, and sovereign issuance by Nathalie Lustig.",
    url: "https://thebasispoint.finance",
    siteName: "The Basis Point",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Basis Point",
    description:
      "Notes on rates, credit, and sovereign issuance by Nathalie Lustig.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="site">
        <noscript>
          <style>{`.top-name-mark .bp-mark{opacity:1;transform:none}.top-name-word{clip-path:none;transform:none}.scroll-reveal .sr-char{transform:none}.article-reveal .ap-back,.article-reveal .trade-back,.article-reveal .ap-meta,.article-reveal .article-meta-top,.article-reveal .ap-deck,.article-reveal .article-deck,.article-reveal .ap-col>p:first-of-type,.article-reveal .article-body>p:first-of-type{opacity:1;transform:none}.article-reveal .trade-rule{transform:scaleX(1)}`}</style>
        </noscript>
        <Chrome footer={<ContactFooter />}>{children}</Chrome>
        <Analytics />
      </body>
    </html>
  );
}
