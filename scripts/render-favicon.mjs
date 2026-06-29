// Renders the BasisPointMark to a 256×256 PNG and writes it to
// src/app/icon.png — the Next.js App Router favicon path. The mark is the
// "+1bp" aurora-rim circle (handoff variant A). The PNG canvas is square
// but only the circle paints (transparent corners), so browsers render it
// as a circular mark. Re-run after any change to the SVG.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// Keep this SVG visually in sync with src/components/BasisPointMark.tsx.
// Fonts: Source Serif 4 isn't installed on the rendering machine, so we
// fall back to Times New Roman (same Times-family serif as Source Serif).
// Inter isn't installed either, so the sans elements fall back to
// Helvetica. The visual difference at favicon scale is invisible.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130" width="256" height="256" fill="none">
  <defs>
    <radialGradient id="bg" cx="50%" cy="58%" r="55%">
      <stop offset="0%" stop-color="#0E1E45"/>
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
  <text x="33" y="77" font-family="Inter, Helvetica, Arial, sans-serif" font-size="26" font-weight="300" fill="rgba(255,255,255,0.85)">+</text>
  <text x="50" y="82" font-family="Source Serif 4, Times New Roman, Times, Georgia, serif" font-size="48" font-weight="600" fill="white">1</text>
  <text x="78" y="73" font-family="Inter, Helvetica, Arial, sans-serif" font-size="17" font-weight="300" fill="#5B9AE8">bp</text>
</svg>`;

const buf = await sharp(Buffer.from(svg))
  .png()
  .toBuffer();

await writeFile("src/app/icon.png", buf);
console.log("Wrote src/app/icon.png (256×256)");
