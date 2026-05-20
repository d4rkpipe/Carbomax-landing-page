// carbomax-ui.jsx — small reusable UI primitives

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// Reveal on scroll
function Reveal({ children, delay = 0, as: As = "div", className = "", style = {}, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setShown(true); }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <As ref={ref}
        className={`reveal ${shown ? "in" : ""} ${className}`}
        style={{ transitionDelay: `${delay}ms`, ...style }}
        {...rest}>
      {children}
    </As>
  );
}

// Carbomax logo mark — brand badge image
function Logo({ size = 48 }) {
  return (
    <img
      src="uploads/photo_2026-05-04_16-33-29.jpg"
      alt="Carbomax"
      width={size} height={size}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

// CountUp — animates when in view
function CountUp({ to, duration = 1600, suffix = "", prefix = "", decimals = 0 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setStarted(true); }),
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let raf;
    const t0 = performance.now();
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(easeOut(p) * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);
  return (
    <span ref={ref} className="tnum">
      {prefix}{decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString("en").replace(/,/g, " ")}{suffix}
    </span>
  );
}

// Section wrapper
function Section({ id, eyebrow, title, sub, children, head = true, alignHead = "between", style = {} }) {
  return (
    <section id={id} style={{ padding: "calc(96px * var(--density)) 0", position: "relative", ...style }}>
      <div className="wrap">
        {head && (title || sub || eyebrow) && (
          <Reveal>
            <div className="section-head" style={{ justifyContent: alignHead === "center" ? "center" : "space-between", textAlign: alignHead === "center" ? "center" : "left", flexDirection: alignHead === "center" ? "column" : "row", alignItems: alignHead === "center" ? "center" : "flex-end" }}>
              <div style={{ maxWidth: 720 }}>
                {eyebrow && <div className="eyebrow">{eyebrow}</div>}
                {title && <h2 className="display">{title}</h2>}
              </div>
              {sub && <p style={{ maxWidth: 380, color: "var(--fg-muted)", fontSize: 16, margin: 0 }}>{sub}</p>}
            </div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

// Lang switcher (dropdown)
function LangSwitcher({ locale, setLocale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const opts = [
    { code: "uz", flag: "🇺🇿", label: "UZ" },
    { code: "ru", flag: "🇷🇺", label: "RU" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ];
  const cur = opts.find(o => o.code === locale) || opts[0];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change language"
        style={{
          background: "transparent", color: "var(--fg)",
          border: "1px solid var(--border)", borderRadius: 999,
          padding: "8px 12px", cursor: "pointer",
          fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.04em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
        <span aria-hidden="true">{cur.flag}</span>
        <span>{cur.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 4 L5 7 L8 4" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="glass" style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          padding: 4, minWidth: 140, boxShadow: "var(--shadow-glass)",
          zIndex: 50,
        }}>
          {opts.map(o => (
            <button key={o.code}
              onClick={() => { setLocale(o.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                background: o.code === locale ? "color-mix(in oklab, var(--primary) 14%, transparent)" : "transparent",
                color: "var(--fg)", border: 0, padding: "10px 12px",
                borderRadius: 8, cursor: "pointer", fontSize: 13,
              }}>
              <span aria-hidden="true">{o.flag}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.04em" }}>{o.label}</span>
              <span style={{ marginLeft: "auto", color: "var(--fg-muted)", fontSize: 12 }}>
                {o.code === "uz" ? "O'zbek" : o.code === "ru" ? "Русский" : "English"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Theme toggle
function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      style={{
        background: "transparent", color: "var(--fg)",
        border: "1px solid var(--border)", borderRadius: 999,
        width: 36, height: 36, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
      {isDark
        ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13 9.5A6 6 0 1 1 6.5 3 5 5 0 0 0 13 9.5z" fill="currentColor"/></svg>
        : <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="1.5" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="14.5"/><line x1="1.5" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="14.5" y2="8"/><line x1="3.4" y1="3.4" x2="4.4" y2="4.4"/><line x1="11.6" y1="11.6" x2="12.6" y2="12.6"/><line x1="3.4" y1="12.6" x2="4.4" y2="11.6"/><line x1="11.6" y1="4.4" x2="12.6" y2="3.4"/></g></svg>}
    </button>
  );
}

Object.assign(window, { Reveal, Logo, CountUp, Section, LangSwitcher, ThemeToggle });
