import { PortableText as PT, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.client";
import { blockText, headingId } from "@/lib/toc";
import { GlossaryTerm } from "@/components/GlossaryTerm";

type Source = { _key: string; text: string };

function buildComponents(sources: Source[]): PortableTextComponents {
  const indexOf = (key: string) => sources.findIndex((s) => s._key === key) + 1;

  return {
  types: {
    execSummary: ({ value }) => (
      <div className="exec-summary">
        <span className="exec-summary-label">Executive Summary</span>
        <p>{value.text}</p>
      </div>
    ),
    callout: ({ value }) => (
      <div className="callout">
        <span className="callout-label">{value.label ?? "Key Insight"}</span>
        <p>{value.text}</p>
      </div>
    ),
    pullQuote: ({ value }) => (
      <figure className="pull-quote">
        <p>{value.text}</p>
        {value.attribution && <figcaption>{value.attribution}</figcaption>}
      </figure>
    ),
    annotation: ({ value }) => (
      <div className="annotation">
        <span className="annotation-label">{value.label ?? "Note"}</span>
        <p>{value.text}</p>
      </div>
    ),
    dataStrip: ({ value }) => (
      <div className="data-strip">
        {(value.items ?? []).map(
          (item: { value?: string; label?: string }, i: number) => (
            <div className="ds-item" key={i}>
              <div className="ds-val">{item.value}</div>
              <div className="ds-label">{item.label}</div>
            </div>
          ),
        )}
      </div>
    ),
    image: ({ value }) => {
      const url = urlFor(value).width(1600).url();
      return (
        <figure className="read-figure">
          <Image
            src={url}
            alt={value.alt ?? ""}
            width={1600}
            height={900}
          />
          {value.caption && (
            <figcaption className="read-figure-cap">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children, value }) => (
      <h2 id={headingId(blockText(value as { children?: { text?: string }[] }))}>{children}</h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={headingId(blockText(value as { children?: { text?: string }[] }))}>{children}</h3>
    ),
    sectionLabel: ({ children }) => <p className="section-label">{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    glossary: ({ children, value }) => (
      <GlossaryTerm
        term={value.term}
        definition={value.definition}
        moreHref={value.moreHref}
      >
        {children}
      </GlossaryTerm>
    ),
    citation: ({ children, value }) => {
      const n = indexOf(value.sourceKey);
      // A citation pointing at a source that has since been deleted renders
      // as plain text rather than a dead marker.
      if (n < 1) return <>{children}</>;
      return (
        <>
          {children}
          <a
            className="cite"
            href={`#source-${value.sourceKey}`}
            title={sources[n - 1]?.text}
          >
            {n}
          </a>
        </>
      );
    },
  },
  };
}

export function PortableText({
  value,
  sources = [],
}: {
  value: unknown[];
  sources?: Source[];
}) {
  return <PT value={value as never} components={buildComponents(sources)} />;
}
