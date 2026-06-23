"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function DeskNotesRotator({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2000);
    return () => clearTimeout(id);
  }, [index, words.length]);

  return (
    <p className="dnr">
      <span className="dnr-lead">I write bond notes about </span>
      <span className="dnr-slot" aria-live="polite">
        <span className="dnr-sizer" aria-hidden="true">
          {words.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </span>
        {words.map((w, i) => (
          <motion.span
            key={w}
            className="dnr-word"
            initial={false}
            animate={
              reduce
                ? { opacity: i === index ? 1 : 0, y: 0 }
                : i === index
                  ? { y: "0%", opacity: 1 }
                  : { y: i < index ? "-120%" : "120%", opacity: 0 }
            }
            transition={
              reduce
                ? { duration: 0.18 }
                : { type: "spring", stiffness: 50 }
            }
          >
            {w}
          </motion.span>
        ))}
      </span>
    </p>
  );
}
