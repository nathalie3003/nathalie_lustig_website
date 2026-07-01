import { ImageResponse } from "next/og";

export const alt = "The Basis Point — Notes by Nathalie Lustig";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Aurora-rim "bp" mark, recreated with nested divs so satori can
            render it — an aurora linear-gradient ring wrapping a dark
            radial-gradient inner circle with "bp" set in serif. */}
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
                "radial-gradient(circle at 50% 58%, #0E1E45 0%, #050B18 65%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "Georgia, serif",
              fontSize: 148,
              fontWeight: 600,
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            bp
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: "-1.5px",
            color: "#14161A",
            fontFamily: "Georgia, serif",
          }}
        >
          The Basis Point
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 26,
            color: "rgba(20, 22, 26, 0.72)",
          }}
        >
          Notes by Nathalie Lustig
        </div>
      </div>
    ),
    { ...size },
  );
}
