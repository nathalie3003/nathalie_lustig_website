import { NextRequest, NextResponse } from "next/server";

const BUTTONDOWN_URL = "https://api.buttondown.com/v1/subscribers";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim() : undefined;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error("BUTTONDOWN_API_KEY is not set");
    return NextResponse.json(
      { ok: false, message: "Subscriptions are temporarily unavailable." },
      { status: 500 },
    );
  }

  let res: Response;
  try {
    res = await fetch(BUTTONDOWN_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      // type "regular" skips Buttondown's double opt-in, so no confirmation
      // email is sent; the subscriber is active immediately.
      body: JSON.stringify({ email_address: email, type: "regular" }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 502 },
    );
  }

  // 201: new subscriber created and active immediately (no double opt-in).
  if (res.status === 201) {
    return NextResponse.json({
      ok: true,
      message: "You're on the list. The next note lands in your inbox.",
    });
  }

  // 400: most commonly the email is already subscribed. Treat that as a
  // friendly no-op rather than an error; anything else is a real validation fail.
  if (res.status === 400) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* body not JSON */
    }
    if (/already|exist|subscrib/i.test(detail)) {
      return NextResponse.json({ ok: true, message: "You are already on the list." });
    }
    return NextResponse.json(
      { ok: false, message: "Please check your email address and try again." },
      { status: 400 },
    );
  }

  console.error("Buttondown returned", res.status);
  return NextResponse.json(
    { ok: false, message: "Something went wrong. Please try again." },
    { status: 502 },
  );
}
