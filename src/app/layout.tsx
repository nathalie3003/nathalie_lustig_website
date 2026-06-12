import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { Chrome } from "@/components/Chrome";
import { ContactFooter } from "@/components/Footer";

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
  title: "Nathalie Lustig",
  description:
    "Notes on rates, credit, and sovereign issuance — translating what I read across the market into my own analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="site">
        <Chrome footer={<ContactFooter />}>{children}</Chrome>
      </body>
    </html>
  );
}
