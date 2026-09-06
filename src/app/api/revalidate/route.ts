import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }
  // Every cache tag used by a fetch in src/lib/queries.ts. This list has to be
  // extended by hand whenever a new document type is added, which is how
  // glossaryTerm was missed: publishing a term still reached the site, but only
  // when the page's own 30s revalidate came round, rather than immediately the
  // way every other content change does.
  for (const tag of [
    "bondNote",
    "book",
    "project",
    "dailyRead",
    "siteSettings",
    "reply",
    "glossaryTerm",
  ]) {
    revalidateTag(tag);
  }
  return NextResponse.json({ ok: true, revalidated: "all" });
}
