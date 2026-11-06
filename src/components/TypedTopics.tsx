"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 1800;
const GAP_MS = 350;

// "Notes on credit", typed out, held, deleted, then the next topic.
// The first topic is already written on the server render, so the line is
// never blank, and screen readers get one static sentence instead of a
// stream of letters. Reduced motion swaps whole words with no typing.
export function TypedTopics({ lead, words }: { lead: string; words: string[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(words[0] ?? "");
  const [phase, setPhase] = useState<"hold" | "delete" | "type">("hold");

  useEffect(() => {
    if (words.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const word = words[index];
    let id: ReturnType<typeof setTimeout>;

    if (reduce) {
      id = setTimeout(() => {
        const next = (index + 1) % words.length;
        setIndex(next);
        setShown(words[next]);
      }, HOLD_MS + 800);
    } else if (phase === "hold") {
      id = setTimeout(() => setPhase("delete"), HOLD_MS);
    } else if (phase === "delete") {
      if (shown.length > 0) {
        id = setTimeout(() => setShown(shown.slice(0, -1)), DELETE_MS);
      } else {
        id = setTimeout(() => {
          setIndex((index + 1) % words.length);
          setPhase("type");
        }, GAP_MS);
      }
    } else {
      if (shown.length < word.length) {
        id = setTimeout(() => setShown(word.slice(0, shown.length + 1)), TYPE_MS);
      } else {
        setPhase("hold");
        return;
      }
    }
    return () => clearTimeout(id);
  }, [index, phase, shown, words]);

  const sentence =
    words.length > 1
      ? `${lead} ${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}.`
      : `${lead} ${words[0] ?? ""}.`;

  return (
    <p className="typed">
      <span className="sr-only">{sentence}</span>
      <span aria-hidden="true">
        <span className="typed-lead">{lead} </span>
        <span className="typed-word">{shown}</span>
        <span className={`typed-caret${phase === "hold" ? " is-idle" : ""}`} />
      </span>
    </p>
  );
}
