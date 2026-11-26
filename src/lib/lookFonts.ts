import { Bodoni_Moda, Cinzel, Instrument_Serif, UnifrakturMaguntia, Playfair_Display } from "next/font/google";

// Masthead candidates for the design preview (see src/lib/look.ts). Not
// preloaded: a face downloads only when the masthead option using it is on.
// next/font needs literal options in each call, hence the repetition.
const didone = Bodoni_Moda({ subsets: ["latin"], display: "swap", preload: false, weight: ["600", "800"], variable: "--font-mast-didone" });
const engraved = Cinzel({ subsets: ["latin"], display: "swap", preload: false, weight: ["600"], variable: "--font-mast-engraved" });
const italic = Instrument_Serif({ subsets: ["latin"], display: "swap", preload: false, weight: "400", style: "italic", variable: "--font-mast-italic" });
const blackletter = UnifrakturMaguntia({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--font-mast-blackletter" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, weight: ["700", "900"], variable: "--font-mast-playfair" });

export const LOOK_FONT_VARS = [didone, engraved, italic, blackletter, playfair]
  .map((f) => f.variable)
  .join(" ");
