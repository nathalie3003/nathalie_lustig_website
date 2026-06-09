import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata = { title: "Projects — Nathalie Lustig" };

export default function ProjectsPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-10">Projects</h1>
      <div className="grid sm:grid-cols-2 gap-8">
        {projects.map((p) => <ProjectCard key={p.name} project={p} />)}
      </div>
    </section>
  );
}
