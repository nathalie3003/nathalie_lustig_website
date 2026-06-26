import { projects as fallbackProjects } from "@/content/projects";
import { getProjects } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import StackingProjects, { type StackProject } from "./StackingProjects";

export async function ProjectsSection() {
  const cms = await getProjects();
  const items: StackProject[] =
    cms.length > 0
      ? cms.map((p) => ({
          key: p._id,
          title: p.title,
          url: p.url,
          href: p.href,
          live: p.live,
          statusNote: p.statusNote,
          description: p.description,
          imageSrc: p.image ? urlFor(p.image).width(1200).height(800).url() : undefined,
        }))
      : fallbackProjects.map((p) => ({
          key: p.slotId,
          title: p.title,
          url: p.url,
          href: p.href,
          live: p.live,
          statusNote: p.statusNote,
          description: p.description,
          imageSrc: p.image,
        }));

  return <StackingProjects projects={items} />;
}
