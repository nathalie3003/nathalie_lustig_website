import { PortableText as PT, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.client";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlFor(value).width(1200).url();
      return (
        <figure className="my-8">
          <Image src={url} alt={value.alt ?? ""} width={1200} height={800}
                 className="w-full h-auto rounded" />
          {value.caption && (
            <figcaption className="mt-2 text-sm text-ink/60 italic">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => <h2 className="font-serif text-2xl mt-10 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="font-serif text-xl mt-8 mb-2">{children}</h3>,
    normal: ({ children }) => <p className="mb-5 text-lg leading-relaxed">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-navy pl-4 my-6 italic text-ink/80">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer">{children}</a>
    ),
  },
};

export function PortableText({ value }: { value: unknown[] }) {
  return <PT value={value as never} components={components} />;
}
