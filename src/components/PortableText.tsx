import { PortableText as PT, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.client";
import { blockText, headingId } from "@/lib/toc";
import { GlossaryTerm } from "@/components/GlossaryTerm";

const components: PortableTextComponents = {
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
  },
};

export function PortableText({ value }: { value: unknown[] }) {
  return <PT value={value as never} components={components} />;
}
