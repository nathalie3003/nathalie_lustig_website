"use client";

import { useEffect, useState } from "react";
import {
  FOOTER_OPTIONS,
  HERO_OPTIONS,
  LAYOUT_OPTIONS,
  LOOK_HOST_LIVE,
  LOOK_KEYS,
  MAST_OPTIONS,
  TEXTURE_OPTIONS,
} from "@/lib/look";

type Key = keyof typeof LOOK_KEYS;

const GROUPS: {
  key: Key;
  legend: string;
  options: readonly { value: string; label: string }[];
  // Only shown when the homepage is the front page.
  frontOnly?: boolean;
}[] = [
  { key: "hero", legend: "Homepage", options: HERO_OPTIONS },
  { key: "layout", legend: "Front page style", options: LAYOUT_OPTIONS, frontOnly: true },
  { key: "mast", legend: "Masthead type", options: MAST_OPTIONS, frontOnly: true },
  { key: "texture", legend: "Background", options: TEXTURE_OPTIONS },
  { key: "footer", legend: "Footer", options: FOOTER_OPTIONS },
];

// Floating panel for comparing the design directions in src/lib/look.ts.
// Never renders on the live domain.
export function LookSwitcher() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [values, setValues] = useState<Partial<Record<Key, string>>>({});

  useEffect(() => {
    const host = window.location.hostname.replace(/^www\./, "");
    if (host === LOOK_HOST_LIVE) return;
    const root = document.documentElement;
    setEnabled(true);
    const v: Partial<Record<Key, string>> = {};
    for (const g of GROUPS) v[g.key] = root.getAttribute(`data-${g.key}`) || g.options[0].value;
    setValues(v);
    try {
      setOpen(localStorage.getItem("bp-look-panel") !== "closed");
    } catch {}
  }, []);

  if (!enabled) return null;

  const apply = (key: Key, value: string) => {
    const root = document.documentElement;
    root.setAttribute(`data-${key}`, value);
    try {
      localStorage.setItem(LOOK_KEYS[key], value);
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState(null, "", url);
    setValues((v) => ({ ...v, [key]: value }));
    if (key === "hero") window.scrollTo({ top: 0 });
    if (key === "footer") document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const front = values.hero === "frontpage";

  return (
    <aside className={`look-switch${open ? "" : " is-closed"}`} aria-label="Design preview">
      <button
        type="button"
        className="look-switch-toggle"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          try {
            localStorage.setItem("bp-look-panel", next ? "open" : "closed");
          } catch {}
        }}
      >
        {open ? "Hide" : "Design preview"}
      </button>
      {open ? (
        <div className="look-switch-body">
          {GROUPS.filter((g) => !g.frontOnly || front).map((g) => (
            <fieldset key={g.key}>
              <legend>{g.legend}</legend>
              {g.options.map((o) => (
                <label key={o.value}>
                  <input
                    type="radio"
                    name={`look-${g.key}`}
                    checked={values[g.key] === o.value}
                    onChange={() => apply(g.key, o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
