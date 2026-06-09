import Link from "next/link";
import { getLatestNotes } from "@/lib/queries";
import { NoteCard } from "@/components/NoteCard";

export default async function HomePage() {
  const notes = await getLatestNotes(3);

  return (
    <>
      <section className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div>
          <h1 className="font-serif text-5xl leading-tight mb-4">Nathalie Lustig</h1>
          <p className="text-xl text-ink/80 mb-6 max-w-xl">
            Graduate aiming for DCM / Fixed Income Sales. Writing on bond markets twice a week.
          </p>
          <a href="/cv.pdf" className="inline-block bg-navy text-background px-4 py-2 rounded hover:no-underline hover:bg-warm">
            Download CV
          </a>
        </div>
      </section>

      <section className="max-w-prose mx-auto px-6 pb-20">
        <h2 className="font-serif text-2xl mb-2">Latest notes</h2>
        <hr className="mb-2" />
        {notes.length === 0 ? (
          <p className="text-ink/60 italic mt-6">No notes published yet.</p>
        ) : (
          notes.map((n) => <NoteCard key={n._id} note={n} />)
        )}
        <div className="mt-6">
          <Link href="/notes" className="smallcaps text-sm">All notes →</Link>
        </div>
      </section>
    </>
  );
}
