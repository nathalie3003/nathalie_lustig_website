// Pretty host for a newsletter href — strips protocol + www.
export function readHost(href: string): string {
  try {
    const u = new URL(href);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
