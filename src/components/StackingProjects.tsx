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

  const StatusPill = (
    <span className={`stack-pill ${project.live ? "is-live" : "is-soon"}`}>
      <span className="stack-pill-dot" aria-hidden="true" />
      {project.live ? "Live" : "Back soon"}
    </span>
  );

  return (
    <div className="stack-card-slot">
      <motion.article
        style={{
          scale,
          top: `calc(8vh + ${i * 28}px)`,
        }}
        className="stack-card"
      >
        <div className="stack-card-media">
          {project.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.imageSrc} alt={project.title} />
          ) : (
            <div className="stack-card-media-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="stack-card-content">
          <div className="stack-card-meta">{StatusPill}</div>
          <h3 className="stack-card-title">{project.title}</h3>
          <p className="stack-card-desc">{project.description}</p>

          <div className="stack-card-foot">
            {project.live ? (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="stack-card-link"
              >
                Visit {project.url}
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden="true">
                  <path
                    d="M21.5303 6.53033C21.8232 6.23744 21.8232 5.76256 21.5303 5.46967L16.7574 0.696699C16.4645 0.403806 15.9896 0.403806 15.6967 0.696699C15.4038 0.989592 15.4038 1.46447 15.6967 1.75736L19.9393 6L15.6967 10.2426C15.4038 10.5355 15.4038 11.0104 15.6967 11.3033C15.9896 11.5962 16.4645 11.5962 16.7574 11.3033L21.5303 6.53033ZM0 6.75L21 6.75V5.25L0 5.25L0 6.75Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            ) : (
              <span className="stack-card-url">{project.url}</span>
            )}
          </div>
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
            const targetScale = 1 - (projects.length - i) * 0.05;
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
