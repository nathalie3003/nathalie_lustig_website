// Combined site — page components.
// NotePage and CVPage are routed detail views; AboutSection and
// ProjectsSection are blocks of the single scroll home page.
const { useEffect: usePageEffect } = React;

/* ---------------------------------------------------------------
   NOTE DETAIL — full-width reading page (the "bond note")
--------------------------------------------------------------- */
function NotePage({ T, C, slug, navigate }) {
  const note = C.notes.find((n) => n.slug === slug) || C.notes[0];
  const m = window.noteCat(note.slug);
  const idx = C.notes.findIndex((n) => n.slug === note.slug);
  const next = C.notes[(idx + 1) % C.notes.length];

  usePageEffect(() => { window.scrollTo(0, 0); }, [slug]);

  return (
    <article className="page-full read">
      <button className="read-back" onClick={() => navigate({ name: "home", scroll: "notes" })}>← All notes</button>

      <header className="read-head">
        <div className="read-meta-top">
          <span className="l-tag">{m.cat}</span>
          <span className="l-smallcaps">{note.dateLong} · {m.read} read</span>
        </div>
        <h1 className="read-title">{note.title}</h1>
        <p className="read-excerpt">{note.excerpt}</p>
        <span className="read-byline">{note.sample ? "Sample note · seeded to show typography" : "By Nathalie Lustig"}</span>
      </header>

      <div className="read-body">
        {note.body.map((b, i) => {
          if (b.type === "p") return <p key={i}>{b.text}</p>;
          if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
          if (b.type === "quote") return <p key={i} className="read-quote">{b.text}</p>;
          if (b.type === "figure") return (
            <figure key={i} className="read-figure">
              <div className="read-figure-art">{b.placeholder}</div>
              <figcaption className="read-figure-cap">{b.caption}</figcaption>
            </figure>
          );
          return null;
        })}
      </div>

      <footer className="read-foot">
        <span className="l-smallcaps">Next note</span>
        <button className="l-btn l-btn-ghost l-btn-sm" onClick={() => navigate({ name: "note", slug: next.slug })}>
          {next.title} →
        </button>
      </footer>
    </article>
  );
}

/* ---------------------------------------------------------------
   ABOUT — scroll section
--------------------------------------------------------------- */
function AboutSection({ T, C, navigate }) {
  return (
    <section className="band band-about" id="about">
      <div className="page-wide about">
        <span className="l-kicker">About</span>
        <h2 className="about-title">A bit more about me</h2>
        <div className="about-grid">
          <div className="about-bio">
            {C.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            <div className="about-actions">
              <button className="l-btn l-btn-primary" onClick={() => navigate({ name: "cv" })}>{T.cvLabel}</button>
              <button className="l-btn l-btn-ghost" onClick={() => window.scrollToSection("projects")}>See my projects →</button>
            </div>
          </div>
          <image-slot id="about-portrait" class="about-portrait" shape="rounded" radius="16" placeholder="Drop a portrait"></image-slot>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   PROJECTS — scroll section, horizontal cards
--------------------------------------------------------------- */
function ProjectCard({ p }) {
  return (
    <article className="proj-card">
      <image-slot id={p.slotId} class="proj-favicon" shape="rounded" radius="13" placeholder={p.faviconLabel}></image-slot>
      <div className="proj-body">
        <div className="proj-top">
          <h3 className="proj-title">{p.title}</h3>
          <span className={"proj-status " + (p.live ? "is-live" : "is-build")}>{p.status}</span>
        </div>
        {p.live
          ? <a className="proj-url" href={p.href} target="_blank" rel="noopener noreferrer">{p.url} ↗</a>
          : <span className="proj-url is-soon">{p.url}</span>}
        <p className="proj-desc">{p.description}</p>
        <span className="proj-note l-smallcaps">{p.statusNote}</span>
      </div>
    </article>
  );
}

function ProjectsSection({ T, C }) {
  return (
    <section className="band band-projects" id="projects">
      <div className="page-wide projects">
        <span className="l-kicker">Projects</span>
        <h2 className="projects-title">Things I'm building</h2>
        <div className="proj-list">
          {C.projects.map((p) => <ProjectCard key={p.slotId} p={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   CV — lightweight inline view (placeholder for the PDF)
--------------------------------------------------------------- */
function CVPage({ T, C, navigate }) {
  usePageEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-full about">
      <button className="read-back" onClick={() => navigate({ name: "home", scroll: "top" })}>← Back to site</button>
      <span className="l-kicker">Curriculum Vitae</span>
      <h1 className="about-title">{C.name}</h1>
      <p className="hero-lead" style={{ marginTop: "10px" }}>{T.hero.creds}</p>
      <div style={{ marginTop: "22px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a className="l-btn l-btn-primary" href="#" onClick={(e) => e.preventDefault()}>Download PDF</a>
        <button className="l-btn l-btn-ghost" onClick={() => navigate({ name: "home", scroll: "about" })}>Read the long version →</button>
      </div>
      <div className="about-bio" style={{ marginTop: "34px", maxWidth: "640px" }}>
        {C.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

Object.assign(window, { NotePage, AboutSection, ProjectsSection, ProjectCard, CVPage });
