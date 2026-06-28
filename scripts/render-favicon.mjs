// Renders the BasisPointMark to a 256×256 PNG and writes it to
// src/app/icon.png — the Next.js App Router favicon path. Includes axes so
// the favicon matches the inline mark visually. Re-run after any change to
// the mark's path or colors.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// Keep this SVG visually in sync with src/components/BasisPointMark.tsx.
// CSS variables don't apply when sharp rasterises, so colors are resolved
// to concrete values: ACCENT = var(--accent), AXIS = var(--ink-45).
// Stroke widths are bumped (curve 1.6→2.4, axes 0.5→1.0) so the lines stay
// legible after the browser downsamples to 16×16 / 32×32 favicon sizes.
const ACCENT = "#3A5F8A";
const AXIS = "rgba(20,22,26,0.45)";
const CURVE_D = "M 8 24 C 14 23.4, 18 22.4, 22 20 S 30 11, 36 6";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" width="256" height="205">
  <line x1="6" y1="4" x2="6" y2="26" stroke="${AXIS}" stroke-width="1.0" stroke-linecap="square"/>
  <line x1="6" y1="26" x2="38" y2="26" stroke="${AXIS}" stroke-width="1.0" stroke-linecap="square"/>
  <path d="${CURVE_D}" fill="none" stroke="${ACCENT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="36" cy="6" r="1.8" fill="${ACCENT}"/>
</svg>`;

// Render into a square 256×256 canvas with the curve centered vertically
// (the natural aspect ratio is 40:32 = wider than tall, so center it on the
// vertical axis to avoid a stretched look at favicon scale).
const buf = await sharp(Buffer.from(svg))
  .resize(256, 205, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: 26,
    bottom: 25,
    left: 0,
    right: 0,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await writeFile("src/app/icon.png", buf);
console.log("Wrote src/app/icon.png (256×256)");
