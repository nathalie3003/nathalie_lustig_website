import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }
  for (const tag of ["bondNote", "book", "project", "dailyRead", "siteSettings"]) {
    revalidateTag(tag);
  }
  return NextResponse.json({ ok: true, revalidated: "all" });
}
