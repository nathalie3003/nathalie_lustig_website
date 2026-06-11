import { about } from "@/content/about";
import { contactIntro } from "@/content/tone";

export function ContactFooter() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <h2 className="foot-lead">{contactIntro}</h2>
        <dl className="foot-contact">
          {about.contact.map((c) => (
            <div key={c.label} style={{ display: "contents" }}>
              <dt className="l-smallcaps">{c.label}</dt>
              <dd>
                <a href={c.href}>{c.value}</a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="foot-bar">
        <div className="foot-bar-inner">
          <span>© 2026 Nathalie Lustig</span>
          <span>Notes on the fixed income market</span>
        </div>
      </div>
    </footer>
  );
}
