import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
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
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thebasispoint.finance"),
  title: "The Basis Point",
  description:
    "The Basis Point — notes on rates, credit, and sovereign issuance by Nathalie Lustig.",
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
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="site">
        <Chrome footer={<ContactFooter />}>{children}</Chrome>
        <Analytics />
      </body>
    </html>
  );
}
