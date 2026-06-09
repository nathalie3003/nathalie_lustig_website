import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getNoteBySlug, getAllNoteSlugs } from "@/lib/queries";
import { urlFor } from "@/lib/sanity.client";
import { PortableText } from "@/components/PortableText";

export async function generateStaticParams() {
  const slugs = await getAllNoteSlugs();
  return slugs.map((slug) => ({ slug }));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  return (
    <article className="max-w-prose mx-auto px-6 py-16">
      <Link href="/notes" className="smallcaps text-xs text-ink/60">← All notes</Link>
      <h1 className="font-serif text-4xl mt-4 mb-3">{note.title}</h1>
      <div className="smallcaps text-xs text-ink/60 mb-8">{formatDate(note.publishedAt)}</div>
      {note.coverImage && (
        <Image src={urlFor(note.coverImage).width(1400).url()} alt={note.title}
               width={1400} height={900} className="w-full h-auto rounded mb-8" />
      )}
      <PortableText value={note.body} />
    </article>
  );
}
