import { useId } from "react";

type Props = {
  size?: number;
  className?: string;
  decorative?: boolean;
};

// "bp" wordmark inside an aurora-rim circle. Verbatim port of the handoff
// reference SVG (design_handoff_bp_badge/README.md). The viewBox is kept
// at 130×130 so font-size and stroke-width scale proportionally — the
// rendered size is controlled by the `size` prop alone.
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
        x="65"
        y="65"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-serif), 'Source Serif 4', Georgia, serif"
        fontSize="54"
        fontWeight="600"
        letterSpacing="-1.08"
        fill="white"
      >
        bp
      </text>
    </svg>
  );
}
