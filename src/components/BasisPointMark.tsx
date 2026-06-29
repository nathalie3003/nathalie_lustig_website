type Props = {
  size?: number;
  className?: string;
  decorative?: boolean;
};

// "+1bp" inside an aurora-rim circle. The gradient sweeps French Blue →
// violet → pink → warm orange so the ring carries the brand accent (French
// Blue) at the top and shifts through aurora colors around the arc.
// Interior is the same deep ink the site uses elsewhere; the "+1" sits in
// cream serif and the "bp" picks up the accent again at smaller size.
export function BasisPointMark({
  size = 32,
  className,
  decorative = false,
}: Props) {
  const cls = ["bp-mark", className].filter(Boolean).join(" ");
  const gradientId = `bp-aurora-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cls}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "The Basis Point" })}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3A5F8A" />
          <stop offset="35%" stopColor="#6B4FA0" />
          <stop offset="65%" stopColor="#D67896" />
          <stop offset="100%" stopColor="#E0A266" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="#14161A"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
      />
      <text
        x="16"
        y="17.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-serif), Georgia, 'Times New Roman', serif"
        fontWeight="600"
      >
        <tspan fill="#F7F8FA" fontSize="13">+1</tspan>
        <tspan fill="#3A5F8A" fontSize="7.5" dy="0.5">bp</tspan>
      </text>
    </svg>
  );
}
