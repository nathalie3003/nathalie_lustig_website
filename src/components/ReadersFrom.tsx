import { readersFrom } from "@/content/readersFrom";

// The firms readers work at, set as a single run of names like a masthead's
// "as read at" line. Deliberately quieter than Companies covered above it:
// plain text, no links, no logos, since these are readers rather than content.
export function ReadersFrom() {
  if (readersFrom.length === 0) return null;
  return (
    <section className="readers" aria-labelledby="readers-title">
      <div className="home-head">
        <h2 className="home-head-title" id="readers-title">
          Readers from
        </h2>
      </div>
      <ul className="readers-list">
        {readersFrom.map((firm) => (
          <li key={firm}>{firm}</li>
        ))}
      </ul>
    </section>
  );
}
