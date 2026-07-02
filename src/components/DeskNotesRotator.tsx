"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function DeskNotesRotator({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2000);
    return () => clearTimeout(id);
  }, [index, words.length, reduce]);

  return (
    <p className="dnr">
      <span className="dnr-lead">I write bond notes about </span>
      <span className="dnr-slot">
        {/* Sizer: renders every word stacked (hidden) so the slot's width
            auto-fits the visually widest word. */}
        <span className="dnr-sizer" aria-hidden="true">
          {words.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </span>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={words[index]}
            className="dnr-word"
            initial={reduce ? { y: 0, opacity: 0 } : { y: "-120%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduce ? { y: 0, opacity: 0 } : { y: "120%", opacity: 0 }}
            transition={
              reduce
                ? { duration: 0.18 }
                : { type: "spring", stiffness: 50 }
            }
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}
