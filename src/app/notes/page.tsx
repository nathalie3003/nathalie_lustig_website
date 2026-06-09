import { getAllNotes } from "@/lib/queries";
import { NoteCard } from "@/components/NoteCard";

export const metadata = { title: "Notes — Nathalie Lustig" };

export default async function NotesPage() {
  const notes = await getAllNotes();
  return (
    <section className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-2">Bond Notes</h1>
      <p className="text-ink/70 mb-10">Short notes on bond markets, twice a week.</p>
      {notes.length === 0 ? (
        <p className="text-ink/60 italic">No notes published yet.</p>
      ) : (
        notes.map((n) => <NoteCard key={n._id} note={n} />)
      )}
    </section>
  );
}
