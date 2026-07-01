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
        <svg width="340" height="340" viewBox="0 0 130 130">
          <defs>
            <radialGradient id="bg" cx="50%" cy="58%" r="55%">
              <stop offset="0%" stopColor="#0E1E45" />
              <stop offset="100%" stopColor="#050B18" />
            </radialGradient>
            <linearGradient
              id="rim"
              x1="0"
              y1="0"
              x2="130"
              y2="130"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#4488FF" />
              <stop offset="35%" stopColor="#8855FF" />
              <stop offset="65%" stopColor="#FF44AA" />
              <stop offset="100%" stopColor="#FF7733" />
            </linearGradient>
          </defs>
          <circle cx="65" cy="65" r="64" fill="url(#bg)" />
          <circle
            cx="65"
            cy="65"
            r="62"
            fill="none"
            stroke="url(#rim)"
            strokeWidth="2.5"
            opacity="0.9"
          />
          <text
            x="65"
            y="65"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Georgia, serif"
            fontSize="54"
            fontWeight="600"
            fill="white"
          >
            bp
          </text>
        </svg>
        <div
          style={{
            marginTop: 40,
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#14161A",
          }}
        >
          The Basis Point
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 26,
            color: "rgba(20, 22, 26, 0.72)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Notes by Nathalie Lustig
        </div>
      </div>
    ),
    { ...size },
  );
}
