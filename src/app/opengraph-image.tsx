import { ImageResponse } from "next/og";

export const alt = "The Basis Point — Notes by Nathalie Lustig";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori (next/og's renderer) accepts TTF/OTF but not WOFF2. Google Fonts
// serves WOFF2 to modern browsers; using an old-Firefox User-Agent gets it to
// return the TTF URL instead.
async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer | null> {
  try {
    const familyEnc = family.replace(/ /g, "+");
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyEnc}:wght@${weight}`;
    const res = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13",
      },
    });
    if (!res.ok) return null;
    const css = await res.text();
    const match = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (!match) return null;
    const font = await fetch(match[1]);
    if (!font.ok) return null;
    return font.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [serif600, serif400] = await Promise.all([
    loadGoogleFont("Source Serif 4", 600),
    loadGoogleFont("Source Serif 4", 400),
  ]);

  // Render with satori's built-in fallback font if Google Fonts is down —
  // a slightly off-brand OG image beats a failed build or a 500.
  type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" };
  const fonts: OgFont[] = [];
  if (serif600) fonts.push({ name: "Source Serif 4", data: serif600, weight: 600, style: "normal" });
  if (serif400) fonts.push({ name: "Source Serif 4", data: serif400, weight: 400, style: "normal" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FCFAF9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Source Serif 4", Georgia, serif',
        }}
      >
        {/* "bp" on a flat ink disc — matches the SVG BasisPointMark. */}
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: 340,
            background: "#191316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FCFAF9",
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: 148,
            letterSpacing: "-0.028em",
            lineHeight: 1,
          }}
        >
          bp
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: 84,
            letterSpacing: "-0.028em",
            color: "#191316",
            lineHeight: 1,
          }}
        >
          The Basis Point
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontWeight: 400,
            fontSize: 30,
            color: "rgba(25, 19, 22, 0.60)",
            lineHeight: 1.3,
          }}
        >
          Notes by Nathalie Lustig
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length ? { fonts } : {}),
    },
  );
}
