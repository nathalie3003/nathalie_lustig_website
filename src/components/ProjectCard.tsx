import Image from "next/image";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <a href={project.href} target="_blank" rel="noopener noreferrer"
       className="block group border border-rule rounded overflow-hidden hover:no-underline">
      <div className="relative aspect-[4/3] bg-rule">
        <Image src={project.image} alt={project.name} fill className="object-cover" />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-ink group-hover:text-warm">{project.name}</h3>
        <p className="mt-2 text-sm text-ink/80">{project.description}</p>
      </div>
    </a>
  );
}
