import Image from "next/image";
import { projects, type Project } from "@/content/projects";

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="proj-card">
      <Image
        src={p.image}
        alt={`${p.title} logo`}
        width={128}
        height={128}
        className="proj-favicon"
      />
      <div className="proj-body">
        <div className="proj-top">
          <h3 className="proj-title">{p.title}</h3>
          <span className={"proj-status " + (p.live ? "is-live" : "is-build")}>
            {p.status}
          </span>
        </div>
        {p.live ? (
          <a
            className="proj-url"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {p.url} ↗
          </a>
        ) : (
          <span className="proj-url is-soon">{p.url}</span>
        )}
        <p className="proj-desc">{p.description}</p>
        <span className="proj-note l-smallcaps">{p.statusNote}</span>
      </div>
    </article>
  );
}

export function ProjectsSection() {
  return (
    <section className="band band-projects" id="projects">
      <div className="page-wide projects">
        <span className="l-kicker">Projects</span>
        <h2 className="projects-title">Things I&apos;m building</h2>
        <div className="proj-list">
          {projects.map((p) => (
            <ProjectCard key={p.slotId} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
