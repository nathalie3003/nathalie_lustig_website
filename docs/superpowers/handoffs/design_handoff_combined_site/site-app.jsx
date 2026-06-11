// App shell — composes top bar, routed page, persistent footer, tone switcher.
const { useState: useAppState, useEffect: useAppEffect, useRef: useAppRef } = React;

function App() {
  const C = window.SITE_CONTENT;
  const [toneKey, setToneKey] = useAppState(() => localStorage.getItem("nl_tone") || window.TONES[0].key);
  const [route, setRoute] = useAppState(() => {
    try { return JSON.parse(localStorage.getItem("nl_route")) || { name: "home" }; }
    catch (e) { return { name: "home" }; }
  });
  // A section to scroll to once the home page has rendered (set when the user
  // jumps to About/Projects from a detail view).
  const pendingScroll = useAppRef(null);

  const T = window.TONES.find((t) => t.key === toneKey) || window.TONES[0];

  function navigate(r) {
    if (r.name === "home" && r.scroll) {
      if (route.name === "home") {
        window.scrollToSection(r.scroll);
        return;
      }
      pendingScroll.current = r.scroll;
    }
    const stored = { name: r.name };
    if (r.slug) stored.slug = r.slug;
    setRoute(r.name === "home" ? { name: "home" } : r);
    localStorage.setItem("nl_route", JSON.stringify(stored));
  }
  function setTone(k) {
    setToneKey(k);
    localStorage.setItem("nl_tone", k);
  }

  // After routing home with a pending scroll target, scroll once painted.
  useAppEffect(() => {
    if (route.name === "home" && pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollToSection(id)));
    }
  }, [route]);

  let page;
  if (route.name === "note") page = <window.NotePage T={T} C={C} slug={route.slug} navigate={navigate} />;
  else if (route.name === "cv") page = <window.CVPage T={T} C={C} navigate={navigate} />;
  else page = <window.HomePage T={T} C={C} navigate={navigate} />;

  return (
    <div className="site">
      <window.TopBar T={T} route={route} navigate={navigate} />
      <main className="main">{page}</main>
      <window.ContactFooter T={T} C={C} />

      <div className="tone-switch">
        <span className="tone-label">Tone</span>
        {window.TONES.map((t) => (
          <button
            key={t.key}
            className={"tone-opt" + (t.key === toneKey ? " active" : "")}
            onClick={() => setTone(t.key)}
          >
            {t.switchLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
