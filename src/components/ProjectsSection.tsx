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
  return (
    <article className="proj-card">
      {p.imageSrc ? (
        <Image
          src={p.imageSrc}
          alt={`${p.title} logo`}
          width={128}
          height={128}
          className="proj-favicon"
        />
      ) : (
        <span className="proj-favicon" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
          {p.faviconLabel}
        </span>
      )}
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
