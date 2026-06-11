import { PortableText as PT, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.client";

const components: PortableTextComponents = {
  types: {
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
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h2>{children}</h2>,
    blockquote: ({ children }) => <p className="read-quote">{children}</p>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

export function PortableText({ value }: { value: unknown[] }) {
  return <PT value={value as never} components={components} />;
}
