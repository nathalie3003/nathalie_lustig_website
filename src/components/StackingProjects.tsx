"use client";

import { ReactLenis } from "lenis/react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

export type StackProject = {
  key: string;
  title: string;
  description: string;
  href: string;
  url: string;
  live: boolean;
  statusNote: string;
  imageSrc?: string;
  imageFit?: "cover" | "contain";
};

interface CardProps {
  i: number;
  project: StackProject;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

function Card({ i, project, progress, range, targetScale }: CardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="stack-card-slot">
      <motion.article
        style={{
          scale,
          top: `calc(var(--stack-offset-base) + ${i} * var(--stack-offset-step))`,
        }}
        className="stack-card"
      >
        <div className={`stack-card-media ${project.imageFit === "contain" ? "is-contain" : "is-cover"}`}>
          {project.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.imageSrc} alt={project.title} loading="lazy" decoding="async" />
          ) : (
            <div className="stack-card-media-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="stack-card-content">
          <div className="stack-card-status">
            <span
              className="stack-dot"
              style={{ background: project.live ? "#4C7A54" : "#C8A96A" }}
              aria-hidden="true"
            />
            <span className="stack-status-text">
              {project.live ? "Live" : "Rebuilding"} · {project.statusNote}
            </span>
          </div>
          <div className="stack-card-title">{project.title}</div>
          <div className="stack-card-desc">{project.description}</div>
          {/* The address only shows once a project is live. Printing it while
              something is still being rebuilt is an invitation to go and look,
              even though the card is not a link. */}
          {project.live ? (
            <div className="stack-card-url">{project.url} →</div>
          ) : null}
        </div>
      </motion.article>
    </div>
  );
}

export default function StackingProjects({ projects }: { projects: StackProject[] }) {
  const container = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <ReactLenis root>
      <section ref={container} className="band band-stack" id="projects">
        <div className="page-wide stack-header">
          <span className="l-kicker">Projects</span>
          <h2 className="stack-header-title">Things I&rsquo;m building</h2>
        </div>

        <div className="stack-cards">
          {projects.map((project, i) => {
            const targetScale = 1 - (projects.length - 1 - i) * 0.05;
            return (
              <Card
                key={project.key}
                i={i}
                project={project}
                progress={scrollYProgress}
                range={[i * (1 / projects.length), 1]}
                targetScale={targetScale}
              />
            );
          })}
        </div>
      </section>
    </ReactLenis>
  );
}
