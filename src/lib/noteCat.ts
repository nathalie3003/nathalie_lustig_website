// Map a Sanity category value (or undefined) → display tag.
// Falls back to "Note" when no category is set.

export function noteCat(category?: string): { cat: string } {
  switch ((category ?? "").toLowerCase()) {
    case "rates":
      return { cat: "Rates" };
    case "credit":
      return { cat: "Credit" };
    case "sovereigns":
      return { cat: "Sovereigns" };
    default:
      return { cat: "Note" };
  }
}
