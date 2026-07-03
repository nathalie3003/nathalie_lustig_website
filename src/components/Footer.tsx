import { about } from "@/content/about";

export function ContactFooter() {
  const email = about.contact.find((c) => c.label === "Email");
  const linkedIn = about.contact.find((c) => c.label === "LinkedIn");

  return (
    <footer className="foot">
      <div className="foot-inner">
        <p className="foot-lead">
          Happy to chat about bonds, books, or anything in between.
        </p>
        <dl className="foot-contact">
          {email && (
            <>
              <dt>Email</dt>
              <dd>
                <a href={email.href}>{email.value}</a>
              </dd>
            </>
          )}
          {linkedIn && (
            <>
              <dt>LinkedIn</dt>
              <dd>
                <a href={linkedIn.href} target="_blank" rel="noopener noreferrer">
                  {linkedIn.value}
                </a>
              </dd>
            </>
          )}
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
