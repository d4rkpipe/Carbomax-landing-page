// sections.jsx — top-of-page sections
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useT, fmtUZS, PRODUCTS } from './i18n.jsx'
import { Reveal, Logo, CountUp, Section, LangSwitcher, ThemeToggle, rafThrottle } from './ui.jsx'

// ─── Promo banner (dismissible) ───────────────────────────────────────────────
function PromoBanner({ locale }) {
  const t = useT(locale);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("cbx_banner_dismissed") === "1"; } catch (e) { return false; }
  });
  if (dismissed) return null;
  return (
    <div style={{
      background: "color-mix(in oklab, var(--accent) 18%, var(--bg))",
      borderBottom: "1px solid color-mix(in oklab, var(--accent) 30%, var(--border))",
      fontSize: 13,
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "10px 32px", position: "relative" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--fg)" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }}></span>
          {t("banner.text")}
          <a href="#loyalty" style={{ color: "var(--accent)", textDecoration: "none", borderBottom: "1px solid color-mix(in oklab, var(--accent) 60%, transparent)", paddingBottom: 1 }}>
            {t("banner.link")} →
          </a>
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => { setDismissed(true); try { localStorage.setItem("cbx_banner_dismissed", "1"); } catch (e) {} }}
          style={{ position: "absolute", right: 24, background: "transparent", border: 0, color: "var(--fg-muted)", cursor: "pointer", padding: 4, lineHeight: 1, fontSize: 16 }}>
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Header (sticky) ──────────────────────────────────────────────────────────
function Header({ locale, setLocale, theme, setTheme, onCta }) {
  const t = useT(locale);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    const onScroll = rafThrottle(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const items = [
    { id: "home", href: "#home" },
    { id: "products", href: "#products" },
    { id: "services", href: "#services" },
    { id: "about", href: "#about" },
    { id: "contact", href: "#contact" },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: scrolled ? "color-mix(in oklab, var(--bg) 78%, transparent)" : "transparent",
      backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
      borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
      transition: "background .2s ease, border-color .2s ease",
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, gap: 16 }}>
        <a href="#home" style={{ color: "var(--fg)", textDecoration: "none" }}>
          <Logo />
        </a>

        {/* Desktop nav */}
        <nav className="cbx-desktop-nav" style={{ display: "flex", gap: 4 }}>
          {items.map(i => (
            <a key={i.id} href={i.href}
               style={{ color: "var(--fg-muted)", textDecoration: "none", padding: "10px 14px", borderRadius: 999, fontSize: 14, transition: "color .2s, background .2s" }}
               onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.background = "color-mix(in oklab, var(--fg) 5%, transparent)"; }}
               onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.background = "transparent"; }}>
              {t(`nav.${i.id}`)}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="cbx-desktop-only" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LangSwitcher locale={locale} setLocale={setLocale} />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <button className="btn btn-primary btn-sm cbx-desktop-only" onClick={onCta}>
            {t("nav.cta")}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Mobile hamburger */}
          <button
            className="cbx-mobile-only"
            aria-label="Menu"
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: "transparent", color: "var(--fg)", border: "1px solid var(--border)", borderRadius: 999, width: 40, height: 40, cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {mobileOpen
                ? <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="3" y1="13" x2="13" y2="3"/></g>
                : <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="2.5" y1="5" x2="13.5" y2="5"/><line x1="2.5" y1="11" x2="13.5" y2="11"/></g>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="glass cbx-mobile-only" style={{ margin: "0 16px 16px", padding: 16, display: "none", flexDirection: "column", gap: 8 }}>
          {items.map(i => (
            <a key={i.id} href={i.href}
               onClick={() => setMobileOpen(false)}
               style={{ color: "var(--fg)", textDecoration: "none", padding: "10px 12px", borderRadius: 8, fontSize: 15, background: "color-mix(in oklab, var(--fg) 4%, transparent)" }}>
              {t(`nav.${i.id}`)}
            </a>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <LangSwitcher locale={locale} setLocale={setLocale} />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={() => { setMobileOpen(false); onCta(); }}>{t("nav.cta")}</button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cbx-desktop-nav, .cbx-desktop-only { display: none !important; }
          .cbx-mobile-only { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// ─── Hero (3 variants via tweak) ──────────────────────────────────────────────
function Hero({ locale, variant = "split", onCta }) {
  const t = useT(locale);
  const heroPhoto = (
    <image-slot
      id="cbx-hero-photo"
      shape="rounded"
      radius="16"
      placeholder={t("hero.photo")}
      style={{ display: "block", width: "100%", height: "100%", minHeight: 420 }}
    ></image-slot>
  );

  const eyebrow = <div className="eyebrow">{t("hero.eyebrow")}</div>;
  const h1 = (
    <h1 className="display" style={{ fontSize: "clamp(40px, 5.2vw, 72px)", margin: "16px 0 0", maxWidth: 820 }}>
      <span style={{ display: "block" }}>{t("hero.h1_a")}</span>
      <em style={{ fontStyle: "normal", color: "color-mix(in oklab, var(--primary-bright) 90%, var(--fg))", display: "block" }}>{t("hero.h1_b")}</em>
    </h1>
  );
  const sub = (
    <p style={{ color: "var(--fg-muted)", fontSize: 18, lineHeight: 1.55, maxWidth: 540, margin: "24px 0 0" }}>
      {t("hero.sub")}
    </p>
  );
  const ctas = (
    <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
      <a href="#products" className="btn btn-primary">
        {t("hero.ctaPrimary")}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
      <button className="btn btn-ghost" onClick={onCta}>{t("hero.ctaSecondary")}</button>
    </div>
  );
  const trust = (
    <div style={{ display: "flex", gap: 24, marginTop: 36, flexWrap: "wrap", color: "var(--fg-muted)", fontSize: 13 }}>
      {[t("hero.trustA"), t("hero.trustB"), t("hero.trustC")].map((s, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.4" stroke="color-mix(in oklab, var(--primary) 60%, transparent)" strokeWidth="1"/>
            <path d="M5 8.2 L7 10 L11 6" stroke="var(--primary-bright)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {s}
        </span>
      ))}
    </div>
  );

  if (variant === "centered") {
    return (
      <section id="home" style={{ padding: "80px 0 100px", position: "relative" }}>
        <div className="wrap" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Reveal>{eyebrow}</Reveal>
          <Reveal delay={80}>{h1}</Reveal>
          <Reveal delay={160}><div style={{ maxWidth: 560, margin: "0 auto" }}>{sub}</div></Reveal>
          <Reveal delay={240}>{ctas}</Reveal>
          <Reveal delay={320}>{trust}</Reveal>
          <Reveal delay={400} style={{ width: "100%", marginTop: 72, aspectRatio: "21/9", maxHeight: 560 }}>
            {heroPhoto}
          </Reveal>
        </div>
      </section>
    );
  }

  if (variant === "image-first") {
    return (
      <section id="home" style={{ padding: "40px 0 100px", position: "relative" }}>
        <div className="wrap">
          <Reveal style={{ width: "100%", aspectRatio: "21/9", maxHeight: 600, marginBottom: 56 }}>
            {heroPhoto}
          </Reveal>
          <Reveal>{eyebrow}</Reveal>
          <Reveal delay={80}>{h1}</Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 48, alignItems: "end", marginTop: 24 }} className="cbx-hero-imgfirst">
            <Reveal delay={160}>{sub}</Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                {ctas}
                {trust}
              </div>
            </Reveal>
          </div>
        </div>
        <style>{`@media (max-width: 900px) { .cbx-hero-imgfirst { grid-template-columns: 1fr !important; } }`}</style>
      </section>
    );
  }

  // split (default)
  return (
    <section id="home" style={{ padding: "80px 0 100px", position: "relative" }}>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 64, alignItems: "center" }} >
        <div style={{ minWidth: 0 }}>
          <Reveal>{eyebrow}</Reveal>
          <Reveal delay={80}>{h1}</Reveal>
          <Reveal delay={160}>{sub}</Reveal>
          <Reveal delay={240}>{ctas}</Reveal>
          <Reveal delay={320}>{trust}</Reveal>
        </div>
        <Reveal delay={120} style={{ minWidth: 0 }}>
          <div style={{ position: "relative", aspectRatio: "4/5", maxHeight: 620 }}>
            {heroPhoto}
            {/* Floating spec card */}
            <div className="glass" style={{
              position: "absolute", right: 16, bottom: 16,
              padding: "16px 18px", maxWidth: 240,
              boxShadow: "var(--shadow-glass)",
            }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>Magicar · M903F</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, marginTop: 6, lineHeight: 1.15 }}>{t("hero.warrantyLabel")}</div>
              <div className="mono" style={{ color: "var(--fg-muted)", fontSize: 11, marginTop: 8 }}>{fmtUZS(2350000)} {t("common.currency")}</div>
            </div>
          </div>
        </Reveal>
      </div>
      <style>{`@media (max-width: 900px) {
        section#home > .wrap { grid-template-columns: 1fr !important; gap: 40px !important; }
      }`}</style>
    </section>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function Stats({ locale }) {
  const t = useT(locale);
  const items = [
    { v: 5000, suffix: "+", label: t("stats.a") },
    { v: 28, suffix: "", label: t("stats.b") },
    { v: 50, suffix: "+", label: t("stats.c") },
    { v: 4.9, suffix: "", label: t("stats.d"), decimals: 1 },
  ];
  return (
    <section style={{ padding: "calc(40px * var(--density)) 0" }}>
      <div className="wrap">
        <div className="glass" style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} >
          {items.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, borderLeft: i === 0 ? "0" : "1px solid var(--border)", paddingLeft: i === 0 ? 0 : 24 }} className={`cbx-stat-${i}`}>
                <div className="display tnum" style={{ fontSize: "clamp(34px, 4vw, 52px)" }}>
                  <CountUp to={s.v} decimals={s.decimals || 0} suffix={s.suffix} />
                </div>
                <div className="eyebrow" style={{ fontSize: 11 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <style>{`@media (max-width: 900px) {
          section .glass[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          .cbx-stat-2 { border-left: 0 !important; padding-left: 0 !important; }
        }`}</style>
      </div>
    </section>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
function Categories({ locale }) {
  const t = useT(locale);
  const items = t("cats.items");
  // Mini SVG-style category visuals — abstract, geometric (no AI slop emojis)
  const visuals = [
    // seat covers — stacked rectangles
    <svg viewBox="0 0 80 80" key="0" width="64" height="64" aria-hidden="true">
      <rect x="14" y="18" width="36" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="22" y="26" width="36" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M30 36 L50 36 M30 44 L50 44 M30 52 L50 52" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>,
    // mats — overlapping rounded rects
    <svg viewBox="0 0 80 80" key="1" width="64" height="64" aria-hidden="true">
      <rect x="12" y="22" width="30" height="40" rx="10" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="40" y="22" width="30" height="40" rx="10" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M19 30 L34 30 M19 36 L34 36 M19 42 L34 42 M47 30 L62 30 M47 36 L62 36 M47 42 L62 42" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
    </svg>,
    // accessories — concentric / key
    <svg viewBox="0 0 80 80" key="2" width="64" height="64" aria-hidden="true">
      <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="40" cy="40" r="4" fill="currentColor"/>
      <path d="M40 8 L40 16 M40 64 L40 72 M8 40 L16 40 M64 40 L72 40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>,
  ];
  return (
    <Section id="cats" eyebrow="01 · Specialties" title={t("cats.title")} sub={t("cats.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cbx-cats-grid">
        {items.map((c, i) => (
          <Reveal key={i} delay={i * 70}>
            <a href="#products"
               className="card"
               style={{ padding: "28px 24px 24px", display: "flex", flexDirection: "column", gap: 20, height: "100%", textDecoration: "none", color: "var(--fg)", cursor: "pointer", transition: "transform .2s ease, border-color .2s ease, background .2s ease" }}
               onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "color-mix(in oklab, var(--primary) 50%, var(--border))"; e.currentTarget.style.background = "color-mix(in oklab, var(--primary) 4%, var(--surface))"; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.background = ""; }}>
              <div style={{ color: "var(--primary-bright)" }}>{visuals[i]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
                <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 10, letterSpacing: "0.1em" }}>0{i + 1} / {c.tag}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 23, margin: 0, lineHeight: 1.05 }}>{c.name}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary-bright)", fontSize: 13, fontWeight: 500 }}>
                {t("common.view")}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
      <style>{`@media (max-width: 900px) { .cbx-cats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
               @media (max-width: 560px) { .cbx-cats-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Section>
  );
}

// ─── Products carousel + filters ──────────────────────────────────────────────
function Products({ locale, onAddInquiry }) {
  const t = useT(locale);
  const filters = t("products.filters");
  const filterList = [
    { id: "all", label: filters.all },
    { id: "covers", label: filters.covers },
    { id: "mats", label: filters.mats },
    { id: "acc", label: filters.acc },
  ];
  const [active, setActive] = useState("all");
  const items = useMemo(
    () => active === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === active),
    [active]
  );
  const scrollerRef = useRef(null);
  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: "smooth" });
  };
  return (
    <Section id="products" eyebrow="02 · Catalog" title={t("products.title")} sub={t("products.sub")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterList.map(f => (
            <button key={f.id}
              onClick={() => setActive(f.id)}
              style={{
                padding: "8px 14px", fontSize: 13, borderRadius: 999, cursor: "pointer",
                background: active === f.id ? "var(--fg)" : "transparent",
                color: active === f.id ? "var(--bg)" : "var(--fg-muted)",
                border: `1px solid ${active === f.id ? "var(--fg)" : "var(--border)"}`,
                transition: "all .15s ease",
                fontFamily: "var(--font-sans)",
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => scroll(-1)} className="btn btn-ghost btn-icon" aria-label="Prev">
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 3 L4 7 L9 11" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => scroll(1)} className="btn btn-ghost btn-icon" aria-label="Next">
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M5 3 L10 7 L5 11" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="no-scrollbar"
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "320px",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: "4px 4px 16px",
          margin: "0 -4px",
        }}>
        {items.map(p => (
          <article key={p.id} className="card"
            style={{ scrollSnapAlign: "start", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="ph" style={{
              aspectRatio: "4/3", borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0,
            }}>
              {p.car === "Universal" ? t("products.accessoryPhotoLabel") : `${p.car} ${t("products.photoLabel")}`}
            </div>
            <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
              <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 10, letterSpacing: "0.1em" }}>{p.sku} · {p.car}</div>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{p.name[locale]}</h3>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "auto", paddingTop: 12 }}>
                <div>
                  <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 10, letterSpacing: "0.06em" }}>{t("common.fromPrice")}</div>
                  <div className="display tnum" style={{ fontSize: 20, lineHeight: 1 }}>
                    {fmtUZS(p.price)} <span style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>{t("common.currency")}</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onAddInquiry && onAddInquiry(p)}>
                  {t("products.addInquiry")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

// ─── Loyalty / cashback ───────────────────────────────────────────────────────
function Loyalty({ locale }) {
  const t = useT(locale);
  const tiers = t("loyalty.tiers");
  const tierStyles = [
    { bg: "linear-gradient(160deg, #1c2520 0%, #131a14 100%)", ring: "#3a4a3e", accent: "#e8eae0" },
    { bg: "linear-gradient(160deg, #1d3a4a 0%, #0f1f29 100%)", ring: "#4a7a92", accent: "#a8d8ec" },
    { bg: "linear-gradient(160deg, #4a3514 0%, #2a1d08 100%)", ring: "#f5b023", accent: "#f5b023" },
  ];
  return (
    <Section id="loyalty" eyebrow="04 · Loyalty" title={t("loyalty.title")} sub={t("loyalty.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cbx-loyalty-grid">
        {tiers.map((tier, i) => (
          <Reveal key={i} delay={i * 80}>
            <div style={{
              padding: "32px 28px 28px",
              background: tierStyles[i].bg,
              border: `1px solid ${tierStyles[i].ring}`,
              borderRadius: "var(--r-lg)",
              display: "flex", flexDirection: "column", gap: 16,
              minHeight: 320,
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative ring */}
              <div aria-hidden="true" style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", border: `1px solid ${tierStyles[i].ring}`, opacity: 0.4 }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: tierStyles[i].accent }}>
                  {tier.name}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 48, color: tierStyles[i].accent, lineHeight: 1 }}>
                  {tier.percent}
                </div>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, color: "#e8eae0" }}>{tier.desc}</div>
                <div style={{ fontSize: 13, color: "rgba(232,234,224,0.65)" }}>{tier.threshold}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Telegram CTA + QR */}
      <Reveal delay={300}>
        <div className="glass" style={{ marginTop: 32, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, lineHeight: 1.1 }}>{t("loyalty.cta")}</div>
            <div style={{ color: "var(--fg-muted)", fontSize: 14, marginTop: 6 }}>@carbomax_bot</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("loyalty.qrLabel")}</div>
            </div>
            <div style={{ background: "#fff", padding: 6, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/uploads/photo_2026-05-31_02-41-38.jpg" alt="@CARBOMAX_BOT QR" style={{ width: 110, height: "auto", display: "block" }} />
            </div>
          </div>
        </div>
      </Reveal>

      <style>{`@media (max-width: 900px) { .cbx-loyalty-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Section>
  );
}

export { PromoBanner, Header, Hero, Stats, Categories, Products, Loyalty }
