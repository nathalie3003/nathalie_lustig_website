// Paintings the first-visit intro cross-fades through, behind the badge.
// Files live in public/intro. Each visit starts on a different painting and
// then runs through the rest in this order, wrapping round.
//
// position is the CSS object-position used when the painting is cropped to
// fill the screen: phones show only a central upright strip, so point it at
// the part that should survive the crop.
export type IntroPainting = {
  src: string;
  position?: string;
};

export const INTRO_PAINTINGS: IntroPainting[] = [
  // Botticelli, The Birth of Venus (c. 1485), the whole painting. Its shape is
  // close to a laptop screen's, so laptops see nearly all of it.
  { src: "/intro/botticelli-venus.jpg", position: "50% 50%" },
  // Turner, The Fighting Temeraire (1839). Phones keep the ship and tug.
  { src: "/intro/turner-temeraire.jpg", position: "25% 50%" },
  // Monet, The Magpie (1868-69). Phones keep the magpie on its gate.
  { src: "/intro/monet-magpie.jpg", position: "15% 50%" },
  // Raphael, The School of Athens (1509-11), trimmed to the fresco itself.
  // The arches converge on the badge, which sits over Plato and Aristotle.
  { src: "/intro/raphael-school-of-athens.jpg", position: "50% 50%" },
  // Van Gogh, Cafe Terrace at Night (1888). Upright, so laptops see a band
  // across it: held on the awning and the lit terrace.
  { src: "/intro/van-gogh-cafe-terrace.jpg", position: "50% 58%" },
];
