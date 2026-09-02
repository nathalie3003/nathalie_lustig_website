type Props = {
  size?: number;
  className?: string;
  decorative?: boolean;
};

// "bp" set in Source Serif 4 on a flat ink disc. The viewBox stays at 130×130
// so font-size and letter-spacing scale proportionally — rendered size is
// controlled by the `size` prop alone.
export function BasisPointMark({
  size = 30,
  className,
  decorative = false,
}: Props) {
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
      <circle cx="65" cy="65" r="65" fill="#191316" />
      <text
        x="65"
        y="65"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-serif), 'Source Serif 4', Georgia, serif"
        fontSize="65"
        fontWeight="600"
        letterSpacing="-2.2"
        fill="#FCFAF9"
      >
        bp
      </text>
    </svg>
  );
}
