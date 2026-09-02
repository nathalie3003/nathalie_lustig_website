import Link from "next/link";

export function ContactFooter() {
  return (
    <footer className="foot">
      <div className="foot-bar">
        <div className="foot-bar-inner">
          <span>© 2026 Nathalie Lustig · Notes on the fixed income market</span>
          <span className="foot-bar-right">
            <Link href="/notes">Notes</Link>
            <Link href="/#about">About</Link>
            <a href="/rss.xml">RSS</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
