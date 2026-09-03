import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "../../../../sanity/env";

// Separate, write-capable client. The CDN-backed client in
// src/lib/sanity.client.ts stays read-only and public; this one is for
// server-side mutations only and must never be imported into client code.
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 80;

// Rate limit: at most 5 replies per IP per 10 minute window. This Map lives
// per serverless instance, so it resets on cold start and is not shared
// across instances or regions. It is a deterrent, not a hard guarantee: a
// real limit would need a shared store (e.g. Redis).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  let body: { noteId?: unknown; name?: unknown; text?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: "website" is a field the real form hides with CSS, so a human
  // never fills it in. A non-empty value means a bot filled in every field
  // it could find. We return success anyway, rather than an error, so the
  // bot gets no signal about why its post silently did nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const noteId = typeof body.noteId === "string" ? body.noteId.trim() : "";
  if (!noteId) {
    return NextResponse.json(
      { ok: false, message: "Missing note reference." },
      { status: 400 },
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { ok: false, message: "Please write a reply before submitting." },
      { status: 400 },
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { ok: false, message: `Replies are limited to ${MAX_TEXT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  let name: string | undefined;
  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    name = trimmed ? trimmed.slice(0, MAX_NAME_LENGTH) : undefined;
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "You're replying a little fast. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("SANITY_API_WRITE_TOKEN is not set");
    return NextResponse.json(
      { ok: false, message: "Replies are temporarily unavailable." },
      { status: 500 },
    );
  }

  try {
    await writeClient.create({
      _type: "reply",
      note: { _type: "reference", _ref: noteId },
      name,
      text,
      createdAt: new Date().toISOString(),
      hidden: false,
    });
  } catch (err) {
    console.error("Failed to write reply", err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 502 },
    );
  }

  revalidateTag("reply");

  // Email notification via Resend, best-effort. A missing key or a failed
  // send must never turn a successful reply into an error for the poster.
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.info("RESEND_API_KEY is not set, skipping reply notification email.");
  } else {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: "nathalie.lustig03@gmail.com",
          subject: "New reply on nathalielustig.com",
          text: `${name ?? "Anonymous"} replied on note ${noteId}:\n\n${text}`,
        }),
      });
    } catch (err) {
      console.error("Failed to send reply notification email", err);
    }
  }

  return NextResponse.json({ ok: true, message: "Reply posted." });
}
