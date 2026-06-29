// Renders the BasisPointMark to a 256×256 PNG and writes it to
// src/app/icon.png — the Next.js App Router favicon path. The mark is the
// "+1bp" aurora-rim circle; the PNG canvas is square but only the circle
// paints (transparent corners), so browsers render it as a circular mark.
// Re-run after any change to the mark's gradient, colors, or text.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// Keep this SVG visually in sync with src/components/BasisPointMark.tsx.
// CSS variables don't apply when sharp rasterises, so colors are resolved
// to concrete values: ACCENT = var(--accent), INK = var(--ink),
// CREAM = var(--bg). The font stack uses Times New Roman explicitly so
// librsvg picks a Times-family serif during rasterisation (Source Serif 4
// isn't installed on the rendering machine).
const ACCENT = "#3A5F8A";
const INK = "#14161A";
const CREAM = "#F7F8FA";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="256" height="256">
  <defs>
    <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="35%" stop-color="#6B4FA0"/>
      <stop offset="65%" stop-color="#D67896"/>
      <stop offset="100%" stop-color="#E0A266"/>
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14.5" fill="${INK}" stroke="url(#aurora)" stroke-width="1.5"/>
  <text x="16" y="20.5" text-anchor="middle"
        font-family="Times New Roman, Times, Georgia, serif"
        font-weight="600">
    <tspan fill="${CREAM}" font-size="13">+1</tspan><tspan fill="${ACCENT}" font-size="7.5">bp</tspan>
  </text>
</svg>`;

const buf = await sharp(Buffer.from(svg))
  .png()
  .toBuffer();

await writeFile("src/app/icon.png", buf);
console.log("Wrote src/app/icon.png (256×256)");
