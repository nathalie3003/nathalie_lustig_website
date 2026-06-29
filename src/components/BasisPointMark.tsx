import { useId } from "react";

type Props = {
  size?: number;
  className?: string;
  decorative?: boolean;
};

// "+1bp" inside an aurora-rim circle. Recreated pixel-for-pixel from the
// design handoff in scratchpad: viewBox stays at 130×130 (preserves the
// exact text positions from the reference), the visible size is set by
// the `size` prop. The radial fill darkens center → edge; the linear rim
// gradient sweeps blue → violet → pink → warm. Three separate <text>
// elements give precise placement of "+", "1", and "bp" without relying
// on text metrics.
export function BasisPointMark({
  size = 34,
  className,
  decorative = false,
}: Props) {
  const uid = useId().replace(/[:]/g, "");
  const bgId = `bp-bg-${uid}`;
  const rimId = `bp-rim-${uid}`;
  const cls = ["bp-mark", className].filter(Boolean).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 130"
      fill="none"
      className={cls}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "The Basis Point" })}
    >
      <defs>
        <radialGradient id={bgId} cx="50%" cy="58%" r="55%">
          <stop offset="0%" stopColor="#0E1E45" />
          <stop offset="100%" stopColor="#050B18" />
        </radialGradient>
        <linearGradient
          id={rimId}
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
      <circle cx="65" cy="65" r="64" fill={`url(#${bgId})`} />
      <circle
        cx="65"
        cy="65"
        r="62"
        fill="none"
        stroke={`url(#${rimId})`}
        strokeWidth="2.5"
        opacity="0.9"
      />
      <text
        x="33"
        y="77"
        fontFamily="var(--font-sans), Inter, system-ui, sans-serif"
        fontSize="26"
        fontWeight="300"
        fill="rgba(255,255,255,0.85)"
      >
        +
      </text>
      <text
        x="50"
        y="82"
        fontFamily="var(--font-serif), 'Source Serif 4', Georgia, serif"
        fontSize="48"
        fontWeight="600"
        fill="white"
        dominantBaseline="auto"
      >
        1
      </text>
      <text
        x="78"
        y="73"
        fontFamily="var(--font-sans), Inter, system-ui, sans-serif"
        fontSize="17"
        fontWeight="300"
        fill="#5B9AE8"
      >
        bp
      </text>
    </svg>
  );
}
