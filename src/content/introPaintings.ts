// Paintings the first-visit intro cross-fades through, behind the badge.
// Each visit shows INTRO_PER_VISIT of them, starting on a different painting
// each time and running on in this order, wrapping round, so every painting
// comes round across visits.
//
// Each painting is pre-sized in public/intro as <name>-<width>.webp at each of
// INTRO_WIDTHS, at modest quality since the wash sits over it. Pre-sizing
// rather than going through next/image matters here: the head script starts
// downloading the chosen paintings before the app has loaded, and it needs
// plain URLs that are already sitting on the CDN.
//
// position is the CSS object-position used when the painting is cropped to
// fill the screen: phones show only a central upright strip, so point it at
// the part that should survive the crop.
export type IntroPainting = {
  name: string;
  position: string;
};

export const INTRO_PER_VISIT = 3;
export const INTRO_WIDTHS = [1280, 1920] as const;

export const INTRO_PAINTINGS: IntroPainting[] = [
  // Botticelli, The Birth of Venus (c. 1485), the whole painting. Its shape is
  // close to a laptop screen's, so laptops see nearly all of it.
  { name: "botticelli-venus", position: "50% 50%" },
  // Turner, The Fighting Temeraire (1839). Phones keep the ship and tug.
  { name: "turner-temeraire", position: "25% 50%" },
  // Monet, The Magpie (1868-69). Phones keep the magpie on its gate.
  { name: "monet-magpie", position: "15% 50%" },
  // Raphael, The School of Athens (1509-11), trimmed to the fresco itself.
  // The arches converge on the badge, which sits over Plato and Aristotle.
  { name: "raphael-school-of-athens", position: "50% 50%" },
  // Van Gogh, Cafe Terrace at Night (1888), cropped from upright to square
  // around the awning and the lit terrace, which keeps the file light.
  { name: "van-gogh-cafe-terrace", position: "50% 50%" },
];
