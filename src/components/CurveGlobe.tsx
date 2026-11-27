"use client";

import { useEffect, useRef, useState } from "react";
import type { YieldCurvePoint } from "@/lib/marketData";

type Props = { snapshot: YieldCurvePoint[]; asOf: string };

// Experiment: a slowly turning globe of raspberry dots that, on hover, flies
// apart and settles into today's Treasury curve. Canvas, not SVG, because a
// few hundred dots animate every frame.

const N = 620;
const RASPBERRY = [178, 58, 99] as const;
const INK = "rgba(25, 19, 22, 0.55)";
const MORPH_MS = 1400;
const STAGGER_MS = 520;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Monotone cubic through the points, sampled at u in [0, 1] across tenors
// (evenly spaced by index, as the curve card draws them).
function makeCurve(ys: number[]) {
  const n = ys.length;
  const d = ys.slice(1).map((y, i) => y - ys[i]);
  const m = ys.map((_, i) => {
    if (i === 0) return d[0] ?? 0;
    if (i === n - 1) return d[n - 2] ?? 0;
    return d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  });
  return (u: number) => {
    const x = Math.min(Math.max(u, 0), 1) * (n - 1);
    const i = Math.min(Math.floor(x), n - 2);
    const t = x - i;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    return h00 * ys[i] + h10 * m[i] + h01 * ys[i + 1] + h11 * m[i + 1];
  };
}

export function CurveGlobe({ snapshot, asOf }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0); // 0 = globe, 1 = curve
  const progRef = useRef(0);
  const [open, setOpen] = useState(false);
  const set = (v: 0 | 1) => {
    targetRef.current = v;
    setOpen(v === 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ys = snapshot.map((p) => p.yield);
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const curveAt = makeCurve(ys);

    // Fibonacci sphere: even coverage without clumping at the poles.
    const golden = Math.PI * (3 - Math.sqrt(5));
    const dots = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      // Most dots draw the curve; the rest lay a dotted baseline.
      const onLine = i % 6 !== 0;
      const u = onLine ? Math.random() : (i / N);
      return {
        sx: Math.cos(th) * r, sy: y, sz: Math.sin(th) * r,
        onLine, u,
        jitter: (Math.random() - 0.5) * (onLine ? 5 : 0),
        delay: u * STAGGER_MS,
      };
    });

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(wrap);
    let angle = 0;

    function frame(now: number) {
      if (!visible) {
        raf = 0;
        return;
      }
      const dt = Math.min(now - last, 50);
      last = now;
      if (!reduced) angle += dt * 0.00025 * (1 - progRef.current * 0.8);

      // Progress runs in ms of "morph time" so the stagger is real time.
      const total = MORPH_MS + STAGGER_MS;
      const step = reduced ? total : dt;
      const p = progRef.current * total;
      progRef.current =
        (targetRef.current === 1 ? Math.min(p + step, total) : Math.max(p - step, 0)) / total;
      const pt = progRef.current * total;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const R = Math.min(w, h) * 0.42;
      const cx = w / 2, cy = h / 2;
      const tilt = 0.38;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

      const padL = 44, padR = 20, padT = 40, padB = 46;
      const plotW = w - padL - padR, plotH = h - padT - padB;
      const range = hi - lo || 1;
      const yOf = (v: number) => padT + ((hi + range * 0.15 - v) / (range * 1.3)) * plotH;

      for (const d of dots) {
        // Globe position: spin around Y, tilt around X, simple perspective.
        const x1 = d.sx * cosA + d.sz * sinA;
        const z1 = -d.sx * sinA + d.sz * cosA;
        const y1 = d.sy * cosT - z1 * sinT;
        const z2 = d.sy * sinT + z1 * cosT;
        const persp = 1 / (1.9 - z2 * 0.6);
        const gx = cx + x1 * R * persp * 1.3;
        const gy = cy + y1 * R * persp * 1.3;
        const depth = (z2 + 1) / 2;

        // Curve position.
        const tx = padL + d.u * plotW;
        const ty = d.onLine ? yOf(curveAt(d.u)) + d.jitter * 0.4 : padT + plotH;

        const local = Math.min(Math.max((pt - d.delay) / MORPH_MS, 0), 1);
        const k = easeInOut(local);
        // A small arc on the way, so dots swoop rather than slide.
        const lift = Math.sin(k * Math.PI) * (d.jitter * 6 - 18);
        const x = gx + (tx - gx) * k;
        const y = gy + (ty - gy) * k + lift;

        const globeA = 0.18 + depth * 0.82;
        const curveA = d.onLine ? 0.95 : 0.35;
        const a = globeA + (curveA - globeA) * k;
        const globeS = 0.7 + depth * 1.5;
        const curveS = d.onLine ? 1.6 : 1;
        const s = globeS + (curveS - globeS) * k;

        ctx.fillStyle = `rgba(${RASPBERRY[0]}, ${RASPBERRY[1]}, ${RASPBERRY[2]}, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tenor labels and yields fade in once the curve has mostly formed.
      const labelA = Math.min(Math.max((progRef.current - 0.7) / 0.3, 0), 1);
      if (labelA > 0) {
        ctx.globalAlpha = labelA;
        // Three faint gridlines with their yields, as on the curve card.
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "right";
        ctx.lineWidth = 1;
        for (const v of [lo, (lo + hi) / 2, hi]) {
          const gy = Math.round(yOf(v)) + 0.5;
          ctx.strokeStyle = "rgba(25, 19, 22, 0.08)";
          ctx.beginPath();
          ctx.moveTo(padL, gy);
          ctx.lineTo(padL + plotW, gy);
          ctx.stroke();
          ctx.fillStyle = "rgba(25, 19, 22, 0.4)";
          ctx.fillText(v.toFixed(1), padL - 8, gy + 3.5);
        }
        ctx.font = "10.5px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        const n = snapshot.length;
        snapshot.forEach((pnt, i) => {
          const u = n <= 1 ? 0 : i / (n - 1);
          const x = padL + u * plotW;
          const y = yOf(pnt.yield);
          ctx.fillStyle = INK;
          ctx.fillText(pnt.tenorLabel, x, padT + plotH + 18);
          ctx.fillStyle = `rgb(${RASPBERRY.join(",")})`;
          ctx.beginPath();
          ctx.arc(x, y, 3.2, 0, Math.PI * 2);
          ctx.fill();
          // Front end, the 10Y benchmark, and the long end.
          if (i === 0 || i === n - 1 || pnt.tenorLabel === "10Y") {
            ctx.fillText(`${pnt.yield.toFixed(2)}%`, x, y - 10);
          }
        });
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [snapshot]);

  const asOfLabel = new Date(asOf).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div
      ref={wrapRef}
      className="curve-globe"
      data-open={open || undefined}
      tabIndex={0}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") set(1); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") set(0); }}
      onClick={(e) => { if ((e.nativeEvent as PointerEvent).pointerType !== "mouse") set(targetRef.current ? 0 : 1); }}
      onFocus={() => set(1)}
      onBlur={() => set(0)}
      role="img"
      aria-label={`US Treasury yield curve, ${asOfLabel}: ${snapshot
        .map((p) => `${p.tenorLabel} ${p.yield.toFixed(2)}%`)
        .join(", ")}`}
    >
      <canvas ref={canvasRef} />
      <span className="curve-globe-caption" aria-hidden="true">
        <span className="curve-globe-hint">Hover to see the curve</span>
        <span className="curve-globe-date">US Treasury curve · {asOfLabel}</span>
      </span>
    </div>
  );
}
