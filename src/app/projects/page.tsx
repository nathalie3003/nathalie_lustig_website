import { permanentRedirect } from "next/navigation";

export default function ProjectsRedirect() {
  permanentRedirect("/about#projects");
}
