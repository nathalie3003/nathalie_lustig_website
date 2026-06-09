import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-rule">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-ink hover:no-underline">
          Nathalie Lustig
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          <li><Link href="/notes">Notes</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/projects">Projects</Link></li>
          <li>
            <a href="/cv.pdf" className="inline-block bg-navy text-background px-3 py-1.5 rounded hover:no-underline hover:bg-warm">
              Download CV
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
