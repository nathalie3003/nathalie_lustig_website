"use client";

import { useEffect, useState } from "react";
import {
  FOOTER_OPTIONS,
  HERO_OPTIONS,
  LOOK_HOST_LIVE,
  LOOK_KEYS,
  TEXTURE_OPTIONS,
  type FooterLook,
  type HeroLook,
  type TextureLook,
} from "@/lib/look";

// Floating panel for comparing the design directions in src/lib/look.ts.
// Never renders on the live domain.
export function LookSwitcher() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [hero, setHero] = useState<HeroLook>("classic");
  const [texture, setTexture] = useState<TextureLook>("none");
  const [footer, setFooter] = useState<FooterLook>("plain");

  useEffect(() => {
    const host = window.location.hostname.replace(/^www\./, "");
    if (host === LOOK_HOST_LIVE) return;
    const root = document.documentElement;
    setEnabled(true);
    setHero((root.dataset.hero as HeroLook) || "classic");
    setTexture((root.dataset.texture as TextureLook) || "none");
    setFooter((root.dataset.footer as FooterLook) || "plain");
    try {
      setOpen(localStorage.getItem("bp-look-panel") !== "closed");
    } catch {}
  }, []);

  if (!enabled) return null;

  const apply = (key: "hero" | "texture" | "footer", value: string) => {
    const root = document.documentElement;
    root.setAttribute(`data-${key}`, value);
    try {
      localStorage.setItem(LOOK_KEYS[key], value);
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState(null, "", url);
    if (key === "hero") {
      setHero(value as HeroLook);
      window.scrollTo({ top: 0 });
    } else if (key === "texture") {
      setTexture(value as TextureLook);
    } else {
      setFooter(value as FooterLook);
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  };

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
          <fieldset>
            <legend>Homepage</legend>
            {HERO_OPTIONS.map((o) => (
              <label key={o.value}>
                <input
                  type="radio"
                  name="look-hero"
                  checked={hero === o.value}
                  onChange={() => apply("hero", o.value)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Background</legend>
            {TEXTURE_OPTIONS.map((o) => (
              <label key={o.value}>
                <input
                  type="radio"
                  name="look-texture"
                  checked={texture === o.value}
                  onChange={() => apply("texture", o.value)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Footer</legend>
            {FOOTER_OPTIONS.map((o) => (
              <label key={o.value}>
                <input
                  type="radio"
                  name="look-footer"
                  checked={footer === o.value}
                  onChange={() => apply("footer", o.value)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>
        </div>
      ) : null}
    </aside>
  );
}
