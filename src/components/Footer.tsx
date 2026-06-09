import { dailyReads } from "@/content/dailyReads";

export function Footer() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div className="smallcaps text-ink/70">
          © {new Date().getFullYear()} Nathalie Lustig
        </div>
        <ul className="flex items-center gap-3">
          {dailyReads.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                 title={r.name}
                 className="inline-flex items-center justify-center w-9 h-9 border border-rule rounded smallcaps text-xs text-ink hover:bg-navy hover:text-background hover:no-underline">
                {r.short}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
