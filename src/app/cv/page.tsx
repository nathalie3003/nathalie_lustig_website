import { permanentRedirect } from "next/navigation";

// /cv is no longer a standalone page. The button now downloads the PDF
// directly. We keep this route so any existing /cv links land somewhere
// sensible (the PDF file in /public).
export default function CVRedirect() {
  permanentRedirect("/cv.pdf");
}
