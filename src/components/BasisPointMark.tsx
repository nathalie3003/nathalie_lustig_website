"use client";

type Props = {
  size?: number;
  axes?: boolean;
  animate?: boolean;
  className?: string;
  decorative?: boolean;
};

// Hand-tuned path approximating a normal Treasury curve — gentle rise on the
// short end, accelerating into the long end. ViewBox is 40 wide × 32 tall;
// padding leaves room for the axes on the left (x=6) and bottom (y=26).
const CURVE_D = "M 8 24 C 14 23.4, 18 22.4, 22 20 S 30 11, 36 6";
const DOT_END = { cx: 36, cy: 6 };

export function BasisPointMark({
  size = 32,
  axes = true,
  animate = true,
  className,
  decorative = false,
}: Props) {
  const cls = ["bp-mark", animate && "bp-mark-animate", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width={size}
      height={Math.round((size * 32) / 40)}
      viewBox="0 0 40 32"
      className={cls}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "The Basis Point" })}
    >
      {axes && (
        <g className="bp-mark-axes">
          <line x1="6" y1="4" x2="6" y2="26" />
          <line x1="6" y1="26" x2="38" y2="26" />
        </g>
      )}
      <path className="bp-mark-curve" d={CURVE_D} fill="none" />
      <circle
        className="bp-mark-dot"
        cx={DOT_END.cx}
        cy={DOT_END.cy}
        r="1.2"
      />
    </svg>
  );
}
