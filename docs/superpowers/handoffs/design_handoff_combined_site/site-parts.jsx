// Combined site — UI parts. Exported to window for the app shell to compose.
const { useState, useEffect, useRef } = React;

// Smooth-scroll to a section id, accounting for the sticky top bar.
window.scrollToSection = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};

/* ---------------------------------------------------------------
   TOP BAR — name · burger menu (Notes/About/Projects) · Download CV
   On the scroll page the menu jumps to sections; from a detail view
   it routes home first, then scrolls.
--------------------------------------------------------------- */
function TopBar({ T, route, navigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const cats = [
    { name: "Rates", sub: "Curves & central banks" },
    { name: "Credit", sub: "Spreads & new issues" },
    { name: "Sovereigns", sub: "Issuance & restructuring" },
  ];

  // Jump to a section on the scroll page. If we're on a detail view, route
  // home first and let the App scroll once it renders.
  const jump = (id) => {
    setOpen(false);
    if (route.name === "home") window.scrollToSection(id);
    else navigate({ name: "home", scroll: id });
  };

  return (
    <header className="top">
      <div className="top-inner" ref={ref}>
        <button className="top-name" onClick={() => jump("top")}>Nathalie Lustig</button>
        <div className="top-right">
          <nav className="top-links">
            <button className="top-link" onClick={() => jump("notes")}>Notes</button>
            <button className="top-link" onClick={() => jump("about")}>About</button>
            <button className="top-link" onClick={() => jump("projects")}>Projects</button>
          </nav>
          <button className="menu-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span className="bars"><i></i><i></i><i></i></span>
            Menu
          </button>
          <button className="l-btn l-btn-primary l-btn-sm" onClick={() => navigate({ name: "cv" })}>{T.cvLabel}</button>

          {open && (
            <div className="menu-pop" role="menu">
              <button className="menu-row" onClick={() => jump("notes")}>
                <span className="mr-title">Notes</span>
                <span className="mr-sub">{T.menu.notes}</span>
              </button>
              <div className="menu-cats">
                {cats.map((c) => (
                  <button className="menu-cat" key={c.name} onClick={() => jump("notes")}>
                    <span>{c.name}</span><span className="mc-sub">{c.sub}</span>
                  </button>
                ))}
              </div>
              <div className="menu-rule"></div>
              <button className="menu-row" onClick={() => jump("about")}>
                <span className="mr-title">About</span>
                <span className="mr-sub">{T.menu.about}</span>
              </button>
              <button className="menu-row" onClick={() => jump("projects")}>
                <span className="mr-title">Projects</span>
                <span className="mr-sub">{T.menu.projects}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------
   RIGHT RAIL — CTAs · newsletters · books I'm reading (home only)
--------------------------------------------------------------- */
function RightRail({ T, C, navigate }) {
  const latest = C.notes[0];
  return (
    <aside className="home-rail">
      <div className="rail-card">
        <image-slot id="rail-portrait" class="rail-portrait" shape="rounded" radius="12" placeholder="Drop a portrait"></image-slot>
        <p className="rail-role">{T.railRole}</p>
        <div className="rail-actions">
          <button className="l-btn l-btn-primary" onClick={() => navigate({ name: "note", slug: latest.slug })}>{T.readLatest}</button>
          <button className="l-btn l-btn-ghost" onClick={() => navigate({ name: "cv" })}>{T.cvLabel}</button>
        </div>

        <div className="rail-block">
          <span className="l-eyebrow rail-block-head">{T.readsHead}</span>
          <p className="rail-block-note">{T.readsNote}</p>
          <div className="reads">
            {C.dailyReads.map((r) => (
              <a className="read-link" key={r.title} href={r.href} target="_blank" rel="noopener noreferrer">
                <span className="read-name">{r.title.replace(/\s*\(.*\)$/, "")}</span>
                <span className="read-url">{window.readHost(r.href)}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rail-block">
          <span className="l-eyebrow rail-block-head">On the bedside table</span>
          <p className="rail-block-note">The books I'm working through right now.</p>
          <div className="books">
            {C.books.map((b) => (
              <div className="book" key={b.slotId}>
                <image-slot id={b.slotId} class="book-cover" shape="rounded" radius="5" placeholder="Cover"></image-slot>
                <div className="book-meta">
                  <span className="book-status">{b.status}</span>
                  <span className="book-title">{b.title}</span>
                  <span className="book-author">{b.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------
   CONTACT FOOTER — persistent on every page
--------------------------------------------------------------- */
function ContactFooter({ T, C }) {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <h2 className="foot-lead">{T.contactIntro}</h2>
        <dl className="foot-contact">
          {C.about.contact.map((c) => (
            <React.Fragment key={c.label}>
              <dt className="l-smallcaps">{c.label}</dt>
              <dd><a href={c.href}>{c.value}</a></dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
      <div className="foot-bar">
        <div className="foot-bar-inner">
          <span>© 2026 Nathalie Lustig</span>
          <span>Notes on the fixed income market</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------
   HOME — one scroll page: notes (+ rail) → about → projects
--------------------------------------------------------------- */
function HomePage({ T, C, navigate }) {
  const latest = C.notes[0];
  return (
    <div className="scroll-home">
      <div className="home" id="top">
        <div className="home-main">
          <section className="hero">
            <span className="l-kicker hero-kicker">{T.hero.kicker}</span>
            <h1 className="hero-name">Nathalie Lustig</h1>
            <p className="hero-lead">{T.hero.lead}</p>
            <span className="l-smallcaps hero-creds">{T.hero.creds}</span>
            <div className="hero-cta">
              <button className="l-btn l-btn-primary" onClick={() => navigate({ name: "note", slug: latest.slug })}>{T.readLatest}</button>
              <button className="l-btn l-btn-ghost" onClick={() => window.scrollToSection("about")}>About me →</button>
            </div>
          </section>

          <section className="section" id="notes">
            <div className="section-head">
              <span className="l-eyebrow">{T.notesHead}</span>
            </div>
            <div className="notes">
              {C.notes.map((n) => {
                const m = window.noteCat(n.slug);
                return (
                  <button className="note-row" key={n.slug} onClick={() => navigate({ name: "note", slug: n.slug })}>
                    <span className="l-smallcaps note-date">{n.date}</span>
                    <span>
                      <span className="note-title" style={{ display: "block" }}>{n.title}</span>
                      <span className="note-excerpt" style={{ display: "block" }}>{n.excerpt}</span>
                    </span>
                    <span className="l-tag note-tag">{m.cat}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <RightRail T={T} C={C} navigate={navigate} />
      </div>

      <window.AboutSection T={T} C={C} navigate={navigate} />
      <window.ProjectsSection T={T} C={C} />
    </div>
  );
}

Object.assign(window, { TopBar, RightRail, ContactFooter, HomePage });
