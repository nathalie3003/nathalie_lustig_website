import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";

export const metadata: Metadata = {
  title: "About — The Basis Point",
  description:
    "Nathalie Lustig: LSE Economics graduate, CFA Level I, writing notes on rates, credit and sovereign issuance.",
};

// Until the redesign's About page lands, this route renders the section that
// used to sit on the homepage. The homepage dropped it when the hero and note
// list took over that space, and leaving /about as a redirect to /#about would
// have pointed at an anchor that no longer exists.
export default function AboutPage() {
  return <AboutSection />;
}
