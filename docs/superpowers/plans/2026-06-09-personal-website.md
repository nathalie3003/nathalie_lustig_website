# Nathalie's Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a personal website at `nathalielustig.com` (initially on `*.vercel.app`) — bond-notes-led editorial site targeting DCM / Fixed Income Sales recruiters, with a Base44-style CMS authoring flow.

**Architecture:** Next.js 15 (App Router) + TypeScript + Tailwind CSS, deployed on Vercel from a GitHub repo, content powered by Sanity (free tier) with its Studio embedded at `/studio` for password-protected authoring. Bond notes are statically generated with Incremental Static Regeneration; a Sanity webhook triggers Vercel revalidation on publish.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Sanity v3 (client + embedded Studio), Vercel, GitHub. Fonts via `next/font/google` (Source Serif 4 + Inter).

---

## File Structure

Once complete, the repo will look like this:

```
.
├── public/
│   ├── cv.pdf                        # Nathalie uploads CV here
│   ├── headshot.jpg                  # Optional homepage photo
│   └── projects/                     # Project card images
├── sanity/
│   ├── schemas/
│   │   ├── index.ts                  # Schema exports
│   │   └── bondNote.ts               # bondNote document schema
│   └── env.ts                        # Sanity env var reader
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (fonts, nav, footer)
│   │   ├── page.tsx                  # Homepage
│   │   ├── globals.css               # Tailwind + base styles
│   │   ├── about/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── notes/
│   │   │   ├── page.tsx              # Notes index
│   │   │   └── [slug]/page.tsx       # Single note
│   │   ├── studio/
│   │   │   └── [[...tool]]/page.tsx  # Embedded Sanity Studio
│   │   └── api/revalidate/route.ts   # Sanity webhook receiver
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── NoteCard.tsx
│   │   ├── ProjectCard.tsx
│   │   └── PortableText.tsx          # Custom PT renderer
│   ├── lib/
│   │   ├── sanity.client.ts          # Sanity client + image URL builder
│   │   └── queries.ts                # GROQ queries + typed fetchers
│   └── content/
│       ├── about.ts                  # About page copy
│       ├── projects.ts               # Projects card data
│       └── dailyReads.ts             # Footer link data
├── sanity.config.ts                  # Studio config
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                        # gitignored; Sanity project id, token, etc.
```

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: entire project skeleton via `create-next-app`
- Modify: `README.md`, `.gitignore`

- [ ] **Step 1: Run create-next-app in the existing repo directory**

Run from inside `/Users/nathalielustig/Documents/Nathalie's Website`:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Expected: prompts auto-resolved by flags, finishes by installing dependencies. The existing `docs/` folder and `.git/` survive (create-next-app merges into a non-empty dir when files don't conflict).

- [ ] **Step 2: Verify the dev server boots**

```bash
npm run dev
```

Expected: prints `Local: http://localhost:3000` and stays running. Open the URL — default Next.js welcome page renders. Stop the server with Ctrl+C.

- [ ] **Step 3: Commit the scaffold**

```bash
git add .
git commit -m "chore: scaffold Next.js 15 + TypeScript + Tailwind"
```

---

## Task 2: Push to GitHub and connect Vercel

**Files:** none (external service setup)

- [ ] **Step 1: Create an empty GitHub repo**

In a browser: github.com → New repository → name `nathalie-website` → Private (or Public, Nathalie's choice) → do NOT initialize with README/license. Copy the repo URL.

- [ ] **Step 2: Push local repo to GitHub**

```bash
git remote add origin <REPO_URL>
git branch -M main
git push -u origin main
```

Expected: push succeeds; refresh GitHub page and see all files.

- [ ] **Step 3: Connect Vercel to the GitHub repo**

In a browser: vercel.com → Add New → Project → Import the GitHub repo → accept the auto-detected Next.js settings → Deploy.

Expected: build succeeds in ~1 minute. Vercel shows a live `*.vercel.app` URL with the default Next.js welcome page. Note this URL — it becomes the staging URL until a custom domain is added.

- [ ] **Step 4: No commit needed** — this task is configuration only.

---

## Task 3: Design tokens, fonts, and global styles

**Files:**
- Modify: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Configure Tailwind theme tokens**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F3",
        ink: "#1A1A1A",
        navy: "#0A2540",
        warm: "#B45309", // hover accent
        rule: "#E5E0D5",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "680px",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Replace globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { color: theme('colors.ink'); background: theme('colors.background'); }
  body { font-family: theme('fontFamily.sans'); }
  h1, h2, h3, h4 { font-family: theme('fontFamily.serif'); letter-spacing: -0.01em; }
  a { color: theme('colors.navy'); text-decoration: none; }
  a:hover { color: theme('colors.warm'); text-decoration: underline; text-underline-offset: 3px; }
  hr { border-color: theme('colors.rule'); }
  .smallcaps { font-variant-caps: all-small-caps; letter-spacing: 0.08em; }
}
```

- [ ] **Step 3: Load fonts in `src/app/layout.tsx`**

Replace the file with:

```tsx
import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Nathalie Lustig",
  description: "Writing on bond markets twice a week. Graduate aiming for DCM / Fixed Income Sales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

(Nav and Footer are created in Task 4. The build will fail until then — that's expected.)

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx
git commit -m "feat: editorial design tokens, fonts, global styles"
```

---

## Task 4: Build Nav and Footer shell

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/content/dailyReads.ts`

- [ ] **Step 1: Create the daily-reads data file**

Create `src/content/dailyReads.ts`:

```ts
export type DailyRead = { name: string; url: string; short: string };

export const dailyReads: DailyRead[] = [
  { name: "Financial Times", url: "https://www.ft.com", short: "FT" },
  { name: "Bloomberg", url: "https://www.bloomberg.com", short: "BB" },
  { name: "Reuters", url: "https://www.reuters.com", short: "RT" },
  { name: "The Economist", url: "https://www.economist.com", short: "EC" },
  { name: "WSJ", url: "https://www.wsj.com", short: "WSJ" },
  { name: "BondVigilantes", url: "https://www.bondvigilantes.com", short: "BV" },
];
```

(Nathalie can edit names and URLs later — see the comment in the file.)

- [ ] **Step 2: Create Nav component**

Create `src/components/Nav.tsx`:

```tsx
import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-rule">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-ink hover:no-underline">
          Nathalie Lustig
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          <li><Link href="/notes">Notes</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/projects">Projects</Link></li>
          <li>
            <a href="/cv.pdf" className="inline-block bg-navy text-background px-3 py-1.5 rounded hover:no-underline hover:bg-warm">
              Download CV
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Create Footer component**

Create `src/components/Footer.tsx`:

```tsx
import { dailyReads } from "@/content/dailyReads";

export function Footer() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div className="smallcaps text-ink/70">
          © {new Date().getFullYear()} Nathalie Lustig
        </div>
        <ul className="flex items-center gap-3">
          {dailyReads.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                 title={r.name}
                 className="inline-flex items-center justify-center w-9 h-9 border border-rule rounded smallcaps text-xs text-ink hover:bg-navy hover:text-background hover:no-underline">
                {r.short}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify the dev server renders the shell**

```bash
npm run dev
```

Expected: visit `localhost:3000`. Header shows "Nathalie Lustig" + nav + Download CV button; footer shows copyright + six small icon-style links. No console errors. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components src/content
git commit -m "feat: site shell — nav and footer with daily-read icons"
```

---

## Task 5: Build static About and Projects pages

**Files:**
- Create: `src/content/about.ts`, `src/content/projects.ts`, `src/components/ProjectCard.tsx`, `src/app/about/page.tsx`, `src/app/projects/page.tsx`
- Add: placeholder `public/cv.pdf` and `public/projects/*.jpg`

- [ ] **Step 1: Create About content module**

Create `src/content/about.ts`:

```ts
export const about = {
  headline: "About",
  paragraphs: [
    "I'm Nathalie — a recent graduate aiming to start my career in Debt Capital Markets or Fixed Income Sales.",
    "I write a short note on bond markets twice a week. The point is to stay engaged with what's actually moving in rates, credit, and issuance, and to build a small habit of putting reading into my own words.",
    "Outside of bonds, I'm building LittleMissLondon (a jewelry brand) and keeping a portfolio of business and fiction book reviews I started almost a year ago.",
  ],
};
```

- [ ] **Step 2: Create Projects content module**

Create `src/content/projects.ts`:

```ts
export type Project = {
  name: string;
  description: string;
  href: string;
  image: string;
};

export const projects: Project[] = [
  {
    name: "LittleMissLondon",
    description: "An independent jewelry brand I'm building — design, sourcing, and storefront.",
    href: "https://littlemisslondon.example",
    image: "/projects/lml.jpg",
  },
  {
    name: "Book Portfolio",
    description: "Reviews of business and fiction books I've read since 2025.",
    href: "https://bookportfolio.example",
    image: "/projects/books.jpg",
  },
];
```

(URLs and images are placeholders — Nathalie replaces these once each site is live.)

- [ ] **Step 3: Drop placeholder files**

```bash
mkdir -p public/projects
# Create empty PDF placeholder so the CV download button does not 404
printf '%%PDF-1.4\n%%EOF\n' > public/cv.pdf
# Use any solid-color placeholder images for now
curl -sL "https://placehold.co/800x600/0A2540/FAF8F3/png?text=LittleMissLondon" -o public/projects/lml.jpg
curl -sL "https://placehold.co/800x600/0A2540/FAF8F3/png?text=Book+Portfolio" -o public/projects/books.jpg
```

Expected: three files exist under `public/`. Nathalie replaces them with the real CV PDF and real photos later.

- [ ] **Step 4: Create ProjectCard component**

Create `src/components/ProjectCard.tsx`:

```tsx
import Image from "next/image";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <a href={project.href} target="_blank" rel="noopener noreferrer"
       className="block group border border-rule rounded overflow-hidden hover:no-underline">
      <div className="relative aspect-[4/3] bg-rule">
        <Image src={project.image} alt={project.name} fill className="object-cover" />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-ink group-hover:text-warm">{project.name}</h3>
        <p className="mt-2 text-sm text-ink/80">{project.description}</p>
      </div>
    </a>
  );
}
```

- [ ] **Step 5: Build About page**

Create `src/app/about/page.tsx`:

```tsx
import { about } from "@/content/about";

export const metadata = { title: "About — Nathalie Lustig" };

export default function AboutPage() {
  return (
    <article className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-8">{about.headline}</h1>
      {about.paragraphs.map((p, i) => (
        <p key={i} className="mb-5 text-lg leading-relaxed">{p}</p>
      ))}
      <a href="/cv.pdf" className="inline-block mt-6 bg-navy text-background px-4 py-2 rounded hover:no-underline hover:bg-warm">
        Download CV
      </a>
    </article>
  );
}
```

- [ ] **Step 6: Build Projects page**

Create `src/app/projects/page.tsx`:

```tsx
import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata = { title: "Projects — Nathalie Lustig" };

export default function ProjectsPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl mb-10">Projects</h1>
      <div className="grid sm:grid-cols-2 gap-8">
        {projects.map((p) => <ProjectCard key={p.name} project={p} />)}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Verify pages render**

```bash
npm run dev
```

Expected: `localhost:3000/about` shows bio + CV button; `localhost:3000/projects` shows 2 cards with placeholder images. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add public src/content src/components/ProjectCard.tsx src/app/about src/app/projects
git commit -m "feat: about and projects pages"
```

---

## Task 6: Create Sanity project and install dependencies

**Files:**
- Modify: `package.json` (via install), `.env.local` (created), `.gitignore` (verify)

- [ ] **Step 1: Create a Sanity project**

In a browser: sanity.io → sign up / log in → Create new project → name "Nathalie Website" → dataset name `production`, public read. Note the **Project ID** (looks like `abc123de`) shown on the dashboard.

- [ ] **Step 2: Install Sanity packages**

```bash
npm install sanity @sanity/vision @sanity/image-url @portabletext/react next-sanity
```

Expected: installs succeed. `package.json` shows the new dependencies.

- [ ] **Step 3: Create `.env.local`**

Create `.env.local` in the repo root:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=<paste project id here>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
SANITY_REVALIDATE_SECRET=<choose any random string, e.g. openssl rand -hex 24>
```

- [ ] **Step 4: Confirm `.env.local` is gitignored**

```bash
grep -q '^\.env' .gitignore && echo "OK" || echo ".env*" >> .gitignore
```

Expected: prints `OK` (create-next-app already ignored it).

- [ ] **Step 5: Add the same env vars to Vercel**

In the Vercel dashboard → Project → Settings → Environment Variables → add the four variables from `.env.local` for all environments (Production, Preview, Development).

- [ ] **Step 6: No code commit yet** — env setup is configuration. Commit happens at the end of Task 7.

---

## Task 7: Define the bondNote schema

**Files:**
- Create: `sanity/env.ts`, `sanity/schemas/bondNote.ts`, `sanity/schemas/index.ts`, `sanity.config.ts`

- [ ] **Step 1: Create `sanity/env.ts`**

```ts
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

if (!projectId || !dataset || !apiVersion) {
  throw new Error("Missing Sanity env vars. Check .env.local");
}
```

- [ ] **Step 2: Create `sanity/schemas/bondNote.ts`**

```ts
import { defineType, defineField } from "sanity";

export const bondNote = defineType({
  name: "bondNote",
  title: "Bond Note",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      type: "string",
      description: "Optional 1-line summary. Falls back to first ~25 words of body.",
      validation: (r) => r.max(200),
    }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true }, fields: [
          { name: "caption", type: "string", title: "Caption" },
          { name: "alt", type: "string", title: "Alt text" },
        ] },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
```

- [ ] **Step 3: Create `sanity/schemas/index.ts`**

```ts
import { bondNote } from "./bondNote";
export const schemaTypes = [bondNote];
```

- [ ] **Step 4: Create `sanity.config.ts` in the repo root**

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { projectId, dataset } from "./sanity/env";

export default defineConfig({
  name: "default",
  title: "Nathalie Website",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
```

- [ ] **Step 5: Commit**

```bash
git add sanity sanity.config.ts package.json package-lock.json .gitignore
git commit -m "feat: sanity setup and bondNote schema"
```

---

## Task 8: Embed Sanity Studio at /studio

**Files:**
- Create: `src/app/studio/[[...tool]]/page.tsx`, `src/app/studio/[[...tool]]/layout.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Allow Studio to mount in Next.js**

Replace `next.config.ts`:

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default config;
```

- [ ] **Step 2: Create the Studio route layout**

Studio needs to escape the site Nav/Footer. Create `src/app/studio/[[...tool]]/layout.tsx`:

```tsx
export const metadata = { title: "Studio" };

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

(Because this layout returns just `{children}`, it overrides the section but the root `layout.tsx` still wraps it. To fully escape the site shell, see Step 3.)

- [ ] **Step 3: Create the Studio page**

Create `src/app/studio/[[...tool]]/page.tsx`:

```tsx
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 4: Hide Nav/Footer on the Studio route**

Edit `src/app/layout.tsx` — replace the body block so Nav/Footer are skipped under `/studio`. Use a thin client hook:

Create `src/components/Chrome.tsx`:

```tsx
"use client";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  if (isStudio) return <>{children}</>;
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

Then update `src/app/layout.tsx` — replace the inside of `<body>` so it reads:

```tsx
<body className="min-h-screen flex flex-col">
  <Chrome>{children}</Chrome>
</body>
```

And add the import at the top: `import { Chrome } from "@/components/Chrome";` (remove the now-unused Nav/Footer imports).

- [ ] **Step 5: Verify Studio loads**

```bash
npm run dev
```

Visit `localhost:3000/studio`. Expected: Sanity Studio login screen renders (sign in with the Google / Github / email used to create the project). After login, the schema appears with a "Bond Note" type. Stop the server.

- [ ] **Step 6: Create one test note in Studio**

In the running Studio, create a "Bond Note" with a title like "Test note — Japan JGBs", any body text, then **Publish**. This gives Task 9 real data to fetch.

- [ ] **Step 7: Commit**

```bash
git add src/app src/components/Chrome.tsx next.config.ts
git commit -m "feat: embed sanity studio at /studio"
```

---

## Task 9: Sanity client and typed queries

**Files:**
- Create: `src/lib/sanity.client.ts`, `src/lib/queries.ts`

- [ ] **Step 1: Create the Sanity client**

Create `src/lib/sanity.client.ts`:

```ts
import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { projectId, dataset, apiVersion } from "../../sanity/env";

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: unknown) => builder.image(source as never);
```

- [ ] **Step 2: Create queries and fetchers**

Create `src/lib/queries.ts`:

```ts
import { sanityClient } from "./sanity.client";

export type BondNoteCard = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  coverImage?: { asset: { _ref: string } };
};

export type BondNote = BondNoteCard & {
  body: unknown[];
};

const CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  coverImage
`;

export async function getLatestNotes(limit = 3): Promise<BondNoteCard[]> {
  return sanityClient.fetch(
    `*[_type == "bondNote"] | order(publishedAt desc)[0...$limit]{ ${CARD_FIELDS} }`,
    { limit },
    { next: { revalidate: 60, tags: ["bondNote"] } },
  );
}

export async function getAllNotes(): Promise<BondNoteCard[]> {
  return sanityClient.fetch(
    `*[_type == "bondNote"] | order(publishedAt desc){ ${CARD_FIELDS} }`,
    {},
    { next: { revalidate: 60, tags: ["bondNote"] } },
  );
}

export async function getNoteBySlug(slug: string): Promise<BondNote | null> {
  return sanityClient.fetch(
    `*[_type == "bondNote" && slug.current == $slug][0]{ ${CARD_FIELDS}, body }`,
    { slug },
    { next: { revalidate: 60, tags: ["bondNote"] } },
  );
}

export async function getAllNoteSlugs(): Promise<string[]> {
  const slugs: string[] = await sanityClient.fetch(
    `*[_type == "bondNote" && defined(slug.current)].slug.current`,
  );
  return slugs;
}
```

- [ ] **Step 3: Sanity check — fetch from a script**

```bash
node --input-type=module -e "
import('./src/lib/queries.js').catch(() => {});
" 2>&1 | head -1
```

(This will fail because the file is TS — that's fine. Real verification happens when pages render in Task 10.)

- [ ] **Step 4: Commit**

```bash
git add src/lib
git commit -m "feat: sanity client and typed queries"
```

---

## Task 10: Notes index page

**Files:**
- Create: `src/components/NoteCard.tsx`, `src/app/notes/page.tsx`

- [ ] **Step 1: Create NoteCard component**

Create `src/components/NoteCard.tsx`:

```tsx
import Link from "next/link";
import type { BondNoteCard } from "@/lib/queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function NoteCard({ note }: { note: BondNoteCard }) {
  return (
    <article className="py-6 border-b border-rule">
      <div className="smallcaps text-xs text-ink/60 mb-2">{formatDate(note.publishedAt)}</div>
      <h3 className="font-serif text-2xl">
        <Link href={`/notes/${note.slug}`}>{note.title}</Link>
      </h3>
      {note.excerpt && <p className="mt-2 text-ink/80">{note.excerpt}</p>}
    </article>
  );
}
```

- [ ] **Step 2: Create the notes index page**

Create `src/app/notes/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Visit `localhost:3000/notes`. Expected: the test note created in Task 8 appears with title + date. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/components/NoteCard.tsx src/app/notes
git commit -m "feat: notes index page"
```

---

## Task 11: Single bond note page

**Files:**
- Create: `src/components/PortableText.tsx`, `src/app/notes/[slug]/page.tsx`

- [ ] **Step 1: Create PortableText renderer**

Create `src/components/PortableText.tsx`:

```tsx
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
```

- [ ] **Step 2: Create the single-note page**

Create `src/app/notes/[slug]/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Click the test note from `/notes`. Expected: single-note page renders title, date, and body. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/components/PortableText.tsx src/app/notes/[slug]
git commit -m "feat: single bond note page with portable text"
```

---

## Task 12: Wire up the homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace homepage**

Replace `src/app/page.tsx` with:

```tsx
import Link from "next/link";
import Image from "next/image";
import { getLatestNotes } from "@/lib/queries";
import { NoteCard } from "@/components/NoteCard";

export default async function HomePage() {
  const notes = await getLatestNotes(3);

  return (
    <>
      <section className="max-w-5xl mx-auto px-6 py-20 grid sm:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <h1 className="font-serif text-5xl leading-tight mb-4">Nathalie Lustig</h1>
          <p className="text-xl text-ink/80 mb-6 max-w-xl">
            Graduate aiming for DCM / Fixed Income Sales. Writing on bond markets twice a week.
          </p>
          <a href="/cv.pdf" className="inline-block bg-navy text-background px-4 py-2 rounded hover:no-underline hover:bg-warm">
            Download CV
          </a>
        </div>
        <Image src="/headshot.jpg" alt="Nathalie Lustig" width={180} height={180}
               className="rounded-full object-cover hidden sm:block"
               // Falls back gracefully if the file is missing
               onError={undefined} />
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
```

- [ ] **Step 2: Add a headshot placeholder (so build doesn't 404 on the image)**

```bash
curl -sL "https://placehold.co/360x360/0A2540/FAF8F3/png?text=N" -o public/headshot.jpg
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Visit `localhost:3000`. Expected: hero with name, tagline, CV button; Latest notes section shows the test note. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx public/headshot.jpg
git commit -m "feat: homepage hero and latest notes"
```

---

## Task 13: Wire the Sanity → Vercel revalidation webhook

**Files:**
- Create: `src/app/api/revalidate/route.ts`

- [ ] **Step 1: Create the revalidate route**

Create `src/app/api/revalidate/route.ts`:

```ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }
  revalidateTag("bondNote");
  return NextResponse.json({ ok: true, revalidated: "bondNote" });
}
```

- [ ] **Step 2: Configure the webhook in Sanity**

In a browser: sanity.io → Project → API → Webhooks → Create Webhook.
- Name: `Vercel revalidate`
- URL: `https://<your-vercel-url>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET value>`
- Dataset: production
- Trigger on: Create, Update, Delete
- Filter: `_type == "bondNote"`
- HTTP method: POST

Save.

- [ ] **Step 3: Test the webhook**

In Sanity Studio, edit the test note's title and republish. Within ~10 seconds, visit the live Vercel URL — the new title shows on `/` and `/notes` without a manual deploy.

- [ ] **Step 4: Commit**

```bash
git add src/app/api
git commit -m "feat: sanity revalidation webhook"
```

---

## Task 14: Final polish — favicon, OG image, build verification

**Files:**
- Add: `src/app/icon.png`, `src/app/opengraph-image.png` (placeholders)
- Modify: `src/app/layout.tsx` (metadata)

- [ ] **Step 1: Drop favicon and OG image placeholders**

```bash
curl -sL "https://placehold.co/512x512/0A2540/FAF8F3/png?text=NL" -o src/app/icon.png
curl -sL "https://placehold.co/1200x630/0A2540/FAF8F3/png?text=Nathalie+Lustig" -o src/app/opengraph-image.png
```

(Next.js picks these up automatically by filename convention.)

- [ ] **Step 2: Tighten root metadata**

Edit the `metadata` export in `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: { default: "Nathalie Lustig", template: "%s — Nathalie Lustig" },
  description: "Writing on bond markets twice a week. Graduate aiming for DCM / Fixed Income Sales.",
  openGraph: {
    title: "Nathalie Lustig",
    description: "Writing on bond markets twice a week.",
    type: "website",
  },
};
```

- [ ] **Step 3: Run a production build locally**

```bash
npm run build
```

Expected: build succeeds. All pages listed as `○ (Static)` or `ƒ (Dynamic)`. No type errors. If there are errors, fix them before continuing.

- [ ] **Step 4: Commit and push**

```bash
git add src/app
git commit -m "feat: favicon, og image, refined metadata"
git push
```

Expected: Vercel auto-deploys. Visit the Vercel URL — entire site works: homepage with latest notes, `/notes`, `/notes/<slug>`, `/about`, `/projects`, `/studio` (login required), favicon visible in the browser tab.

---

## Task 15: Replace placeholders with real content

**Files:** content/data files and `/public` assets

- [ ] **Step 1: Replace CV PDF**

Drop the real CV at `public/cv.pdf` (overwriting the placeholder).

- [ ] **Step 2: Replace headshot and project images**

Replace `public/headshot.jpg`, `public/projects/lml.jpg`, `public/projects/books.jpg` with real photos.

- [ ] **Step 3: Update project URLs**

Edit `src/content/projects.ts` — set the real `href` for LittleMissLondon and the book portfolio.

- [ ] **Step 4: Update daily-read links**

Edit `src/content/dailyReads.ts` — keep, remove, or replace any of the six entries to match Nathalie's actual reading list.

- [ ] **Step 5: Update About copy**

Edit `src/content/about.ts` — tighten the bio paragraphs in Nathalie's own voice.

- [ ] **Step 6: Commit and push**

```bash
git add public src/content
git commit -m "content: real CV, photos, project URLs, daily reads, bio"
git push
```

Expected: Vercel deploys. Site is now publishable.

---

## Optional follow-ups (not in this plan)

These are explicitly out of scope for the first cut. Pull them into a new plan when ready:

- Custom domain (`nathalielustig.com`) attached to the Vercel project.
- Vercel Analytics enabled.
- Email subscription form for new bond notes.
- Pagination on `/notes` once there are >20 notes.
- Search across notes.
- Promoting About / Projects / dailyReads into Sanity instead of code.
