import { about } from "@/content/about";
import { contactIntro } from "@/content/tone";
import { getSiteSettings } from "@/lib/queries";

export async function ContactFooter() {
  const settings = await getSiteSettings();
  const contact =
    settings?.contact && settings.contact.length > 0
      ? settings.contact
      : about.contact;

  return (
    <footer className="foot">
      <div className="foot-inner">
        <h2 className="foot-lead">{contactIntro}</h2>
        <dl className="foot-contact">
          {contact.map((c) => (
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
