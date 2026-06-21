import Link from "next/link";

const ITEMS = [
  "LSE Economics",
  "ex-J.P. Morgan Private Bank",
  "CFA Level I",
  "CFA Level II — Candidate 2026",
];

export function CredentialStrip() {
  return (
    <div className="cred-strip" aria-label="Credentials">
      <div className="cred-strip-inner">
        <ul className="cred-list">
          {ITEMS.map((item, i) => (
            <li key={item}>
              <span className="cred-item">{item}</span>
              {i < ITEMS.length - 1 ? (
                <span className="cred-sep" aria-hidden="true">·</span>
              ) : null}
            </li>
          ))}
        </ul>
        <Link href="/cv" className="cred-cv">
          Download CV <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
