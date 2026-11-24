import type { Metadata } from "next";
import { Newsreader, Cormorant_Garamond, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "./intro.css";
import { Chrome } from "@/components/Chrome";
import { ContactFooter } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { INTRO_SCRIPT } from "@/lib/introScript";

// Text voice: Newsreader, variable with an optical-size axis, so captions,
// body copy and small headings each get the cut drawn for their size.
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});
// Display voice: Cormorant Garamond, chosen to match the bp mark's angled
// wedge serifs and hairline contrast. Headlines, standfirsts and drop caps only;
// it is too delicate for running text.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
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
    <html
      lang="en"
      className={`${serif.variable} ${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="site">
        <noscript>
          <style>{`.top-name-mark .bp-mark{opacity:1;transform:none}.scroll-reveal .sr-char{transform:none}.article-reveal .ap-back,.article-reveal .trade-back,.article-reveal .ap-meta,.article-reveal .article-meta-top,.article-reveal .ap-deck,.article-reveal .article-deck,.article-reveal .ap-col>p:first-of-type,.article-reveal .article-body>p:first-of-type{opacity:1;transform:none}.article-reveal .trade-rule{transform:scaleX(1)}`}</style>
        </noscript>
        <Chrome footer={<ContactFooter />}>{children}</Chrome>
        <Analytics />
      </body>
    </html>
  );
}
