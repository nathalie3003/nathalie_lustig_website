// Renders the BasisPointMark "bp" badge to a 256×256 PNG and writes it to
// src/app/icon.png — the Next.js App Router favicon path. Verbatim port
// of the handoff reference SVG (design_handoff_bp_badge/README.md). The
// PNG canvas is square but only the circle paints (transparent corners),
// so browsers render it as a circular mark. Re-run after any change to
// the SVG.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// Source Serif 4 isn't installed on the rendering machine, so the rasteriser
// falls back to Times New Roman / Georgia. Source Serif's metrics are close
// enough to Times that the visual difference at favicon scale is invisible.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130" width="256" height="256" fill="none">
  <defs>
    <radialGradient id="bg" cx="50%" cy="58%" r="55%">
      <stop offset="0%"   stop-color="#0E1E45"/>
      <stop offset="100%" stop-color="#050B18"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="130" y2="130" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#4488FF"/>
      <stop offset="35%"  stop-color="#8855FF"/>
      <stop offset="65%"  stop-color="#FF44AA"/>
      <stop offset="100%" stop-color="#FF7733"/>
    </linearGradient>
  </defs>
  <circle cx="65" cy="65" r="64" fill="url(#bg)"/>
  <circle cx="65" cy="65" r="62" fill="none" stroke="url(#rim)" stroke-width="2.5" opacity="0.9"/>
  <text x="65" y="65"
        text-anchor="middle" dominant-baseline="central"
        font-family="Source Serif 4, Times New Roman, Times, Georgia, serif"
        font-size="54" font-weight="600"
        letter-spacing="-1.08"
        fill="white">bp</text>
</svg>`;

const buf = await sharp(Buffer.from(svg))
  .png()
  .toBuffer();

await writeFile("src/app/icon.png", buf);
console.log("Wrote src/app/icon.png (256×256)");
