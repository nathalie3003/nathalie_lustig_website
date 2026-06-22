import Image from "next/image";
import { projects as fallbackProjects } from "@/content/projects";
import { getProjects } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import { ScrollReveal } from "./ScrollReveal";

type CardData = {
  key: string;
  title: string;
  url: string;
  href: string;
  live: boolean;
  status: string;
  statusNote: string;
  faviconLabel: string;
  description: string;
  imageSrc?: string;
};

function ProjectCard({ p }: { p: CardData }) {
  const Logo = p.imageSrc ? (
    <Image
      src={p.imageSrc}
      alt={`${p.title} logo`}
      width={128}
      height={128}
      className="proj-favicon"
    />
  ) : (
    <span
      className="proj-favicon"
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
      }}
    >
      {p.faviconLabel}
    </span>
  );

  const headRow = (
    <div className="proj-card-head">
      {Logo}
      <div className="proj-card-headline">
        <h3 className="proj-title">{p.title}</h3>
        <span className={"proj-status " + (p.live ? "is-live" : "is-build")}>
          {p.status}
        </span>
      </div>
    </div>
  );

  const revealBody = (
    <div className="proj-card-reveal" aria-hidden="true">
      <div className="proj-card-reveal-inner">
        <p className="proj-desc">{p.description}</p>
        <div className="proj-card-reveal-foot">
          <span className={"proj-url" + (p.live ? "" : " is-soon")}>
            {p.live ? `${p.url} ↗` : p.url}
          </span>
          <span className="proj-note l-smallcaps">{p.statusNote}</span>
        </div>
      </div>
    </div>
  );

  // Whole card is clickable only when the project is live.
  if (p.live) {
    return (
      <a
        className="proj-card is-clickable"
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {headRow}
        {revealBody}
      </a>
    );
  }
  return (
    <article className="proj-card is-build">
      {headRow}
      {revealBody}
    </article>
  );
}

export async function ProjectsSection() {
  const cms = await getProjects();
  const items: CardData[] =
    cms.length > 0
      ? cms.map((p) => ({
          key: p._id,
          title: p.title,
          url: p.url,
          href: p.href,
          live: p.live,
          status: p.status,
          statusNote: p.statusNote,
          faviconLabel: p.faviconLabel,
          description: p.description,
          imageSrc: p.image ? urlFor(p.image).width(256).height(256).url() : undefined,
        }))
      : fallbackProjects.map((p) => ({
          key: p.slotId,
          title: p.title,
          url: p.url,
          href: p.href,
          live: p.live,
          status: p.status,
          statusNote: p.statusNote,
          faviconLabel: p.faviconLabel,
          description: p.description,
          imageSrc: p.image,
        }));

  return (
    <section className="band band-projects" id="projects">
      <div className="page-wide projects">
        <span className="l-kicker">Projects</span>
        <ScrollReveal as="h2" className="projects-title">{"Things I'm building"}</ScrollReveal>
        <div className="proj-list">
          {items.map((p) => (
            <ProjectCard key={p.key} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
