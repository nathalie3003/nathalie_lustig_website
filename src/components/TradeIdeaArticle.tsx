import Link from "next/link";
import Image from "next/image";
import { PortableText } from "@/components/PortableText";
import { urlFor, imageDimensions } from "@/lib/sanity.client";
import { ArticleShell } from "@/components/ArticleShell";
import { ArticleToc } from "@/components/ArticleToc";
import { TradeToc } from "@/components/TradeToc";
import { extractHeadings } from "@/lib/toc";
import type { BondNote } from "@/lib/queries";
import { about } from "@/content/about";
import { ArticleReveal } from "@/components/ArticleReveal";
import { ScrollReveal } from "@/components/ScrollReveal";

function Stars({ n }: { n: number }) {
  return (
    <div className="tc-stars" aria-label={`Conviction ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`tc-star${i <= n ? " on" : ""}`} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

// Prev/next used to live here. It now sits in one shared keep-reading section
// on the note page, so a trade idea and a standard note end the same way.
export function TradeIdeaArticle({
  note,
  dateLabel,
  readLabel,
  resetKey,
}: {
  note: BondNote;
  dateLabel: string;
  readLabel: string;
  resetKey: string;
}) {
  const conviction = Math.max(0, Math.min(5, note.conviction ?? 0));
  const headings = extractHeadings(note.body);
  const coverDim = note.coverImage ? imageDimensions(note.coverImage) : null;

  return (
    <ArticleShell className="trade-page">
      <ArticleToc items={headings} />
      <ArticleReveal resetKey={resetKey}>
      <header className="trade-hero">
        <div className="trade-wrap">
          <Link href="/#notes" className="trade-back">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M9.5 11.5L5.5 7.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All notes
          </Link>
          <hr className="trade-rule" />
          <div className="article-meta-top">
            <span className="l-tag">Trade Idea</span>
            <span className="l-smallcaps">
              {dateLabel} · {readLabel}
            </span>
          </div>
          <ScrollReveal key={resetKey} as="h1" className="article-h1" trigger="mount" delay={520}>
            {note.title}
          </ScrollReveal>
          {note.excerpt && <p className="article-deck">{note.excerpt}</p>}
          <p className="ap-byline">
            By <Link href="/about">{about.author}</Link>
          </p>
        </div>

        {note.coverImage && (
          <div className="trade-wrap">
            <div className="trade-hero-img">
              <Image
                src={urlFor(note.coverImage).width(1600).fit("max").url()}
                alt=""
                width={coverDim?.width ?? 1600}
                height={coverDim?.height ?? 900}
                className="cover-img"
                sizes="(max-width: 980px) 100vw, 1050px"
                priority
              />
            </div>
          </div>
        )}
      </header>

      <div className="trade-wrap">
        <div className="trade-layout">
          <article className="article">
            <div className="article-body">
              <PortableText value={note.body} />
            </div>

            {note.sources && note.sources.length > 0 && (
              <div className="sources">
                <span className="sources-label">Sources</span>
                <ol>
                  {note.sources.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}

          </article>

          <aside className="sidebar">
            <TradeToc items={headings} />
            <div className="trade-card">
              {note.tradeRecommendation && (
                <div className="tc-rec">
                  <span className="tc-rec-label">Recommendation</span>
                  <span className="tc-rec-action">{note.tradeRecommendation}</span>
                </div>
              )}

              {note.instrument && (
                <div className="tc-instrument">
                  <span className="tc-field-label">Instrument</span>
                  <div className="tc-instr-name">{note.instrument}</div>
                  {note.instrumentSub && (
                    <div className="tc-instr-sub">{note.instrumentSub}</div>
                  )}
                </div>
              )}

              <div className="tc-stats">
                <div className="tc-stat">
                  <span className="tc-field-label">Horizon</span>
                  <div className="tc-stat-val">{note.horizon ?? "—"}</div>
                </div>
                <div className="tc-stat">
                  <span className="tc-field-label">Nominal</span>
                  <div className="tc-stat-val">{note.nominalYield ?? "—"}</div>
                </div>
                <div className="tc-stat">
                  <span className="tc-field-label">Real yield</span>
                  <div className="tc-stat-val">{note.realYield ?? "—"}</div>
                  {note.realYieldSub && (
                    <div className="tc-stat-sub">{note.realYieldSub}</div>
                  )}
                </div>
              </div>

              {note.view && (
                <div className="tc-row">
                  <span className="tc-field-label">View</span>
                  <span className="tc-row-val">{note.view}</span>
                </div>
              )}

              {note.conviction != null && (
                <div className="tc-row">
                  <span className="tc-field-label">Conviction</span>
                  <Stars n={conviction} />
                </div>
              )}

              {note.keyPoints && note.keyPoints.length > 0 && (
                <div className="tc-section">
                  <span className="tc-field-label">Key Points</span>
                  <ul className="tc-bullets">
                    {note.keyPoints.map((p, i) => (
                      <li key={i}>
                        <i className="bull-icon">✓</i>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {note.keyRisks && note.keyRisks.length > 0 && (
                <div className="tc-section">
                  <span className="tc-field-label">Key Risks</span>
                  <ul className="tc-bullets risks">
                    {note.keyRisks.map((r, i) => (
                      <li key={i}>
                        <i className="bull-icon">–</i>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {note.oneLiner && (
                <div className="tc-summary">
                  <span className="tc-field-label">In one line</span>
                  <p className="tc-summary-text">&ldquo;{note.oneLiner}&rdquo;</p>
                </div>
              )}
            </div>

            <p className="trade-disclaimer">
              Personal analysis only — not investment advice. Figures as of {dateLabel}.
            </p>
          </aside>
        </div>
      </div>
      </ArticleReveal>
    </ArticleShell>
  );
}
