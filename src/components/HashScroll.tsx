"use client";

import { useEffect } from "react";

// On home mount, if the URL has a hash, smooth-scroll to it accounting for the
// sticky top bar. Re-runs when the hash changes (back/forward).
export function HashScroll() {
  useEffect(() => {
    function scrollToHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      // Wait two frames so the section is laid out.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(hash);
          if (!el) return;
          const top = el.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        });
      });
    }
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
  return null;
}
