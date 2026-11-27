import { about } from "@/content/about";

const EMAIL = about.contact.find((c) => c.label === "Email")?.value ?? "";
const LINKEDIN = about.contact.find((c) => c.label === "LinkedIn");
const SUGGEST_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent("Topic suggestion")}`;

/** Two ink boxes stacked beside the latest note: an invitation to suggest a
 *  topic, and the contact details, so a visitor sees how to reach Nathalie
 *  without scrolling to the footer. */
export function EarlyBoxes() {
  return (
    <aside className="early-boxes" aria-label="Get in touch">
      <div className="ink-box ink-box-ask">
        <h2 className="ink-box-title">Want a market story explained?</h2>
        <a href={SUGGEST_HREF} className="ink-pill">
          Suggest a topic
        </a>
      </div>

      <div className="ink-box ink-box-contact">
        <h2 className="ink-box-title">Get in touch</h2>
        <div className="ink-row ink-row-stack">
          <span className="ink-row-label">Email</span>
          <a href={`mailto:${EMAIL}`} className="ink-row-value">
            {EMAIL}
          </a>
        </div>
        {LINKEDIN ? (
          <div className="ink-row">
            <span className="ink-row-label">LinkedIn</span>
            <a
              href={LINKEDIN.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ink-row-value ink-row-link"
            >
              View profile
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
