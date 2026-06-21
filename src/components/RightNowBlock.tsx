import { rightNow, rightNowMeta } from "@/content/rightNow";

// Sticky block on the right side of the About section.
// Each row lights up on hover.

export function RightNowBlock() {
  return (
    <aside className="right-now-block">
      <div className="rnb-card">
        <span className="rnb-eyebrow">{rightNowMeta.eyebrow}</span>
        <p className="rnb-blurb">{rightNowMeta.blurb}</p>
        <dl className="rnb-list">
          {rightNow.map((row) => {
            const rowContent = (
              <>
                <dt className="rnb-label">{row.label}</dt>
                <dd className="rnb-value">
                  {row.value}
                  {row.note ? (
                    <>
                      {" "}
                      <em className="rnb-note">{row.note}</em>
                    </>
                  ) : null}
                </dd>
              </>
            );
            return (
              <div key={row.label} className="rnb-row">
                {row.href ? (
                  <a
                    className="rnb-row-link"
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {rowContent}
                  </a>
                ) : (
                  rowContent
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </aside>
  );
}
