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
): Promise<ArrayBuffer> {
  const familyEnc = family.replace(/ /g, "+");
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyEnc}:wght@${weight}`;
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13",
    },
  }).then((r) => r.text());
  const match = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match) throw new Error(`Font not found: ${family} ${weight}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const [serif600, serif400] = await Promise.all([
    loadGoogleFont("Source Serif 4", 600),
    loadGoogleFont("Source Serif 4", 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F7F8FA",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Source Serif 4", Georgia, serif',
        }}
      >
        {/* Aurora-rim "bp" mark — nested divs match the SVG BasisPointMark:
            outer aurora linear-gradient wrapping a dark radial-gradient inner
            circle, with "bp" set in Source Serif 4 600. */}
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: 340,
            background:
              "linear-gradient(135deg, #4488FF 0%, #8855FF 35%, #FF44AA 65%, #FF7733 100%)",
            padding: 7,
            display: "flex",
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: 340,
              background:
                "radial-gradient(circle at 50% 58%, #0E1E45 0%, #050B18 55%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontWeight: 600,
              fontSize: 141,
              letterSpacing: "-0.028em",
              lineHeight: 1,
            }}
          >
            bp
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: 84,
            letterSpacing: "-0.028em",
            color: "#14161A",
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
            color: "rgba(20, 22, 26, 0.60)",
            lineHeight: 1.3,
          }}
        >
          Notes by Nathalie Lustig
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Source Serif 4",
          data: serif600,
          weight: 600,
          style: "normal",
        },
        {
          name: "Source Serif 4",
          data: serif400,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
