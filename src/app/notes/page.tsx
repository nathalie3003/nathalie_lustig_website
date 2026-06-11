import { permanentRedirect } from "next/navigation";

export default function NotesRedirect() {
  permanentRedirect("/#notes");
}
