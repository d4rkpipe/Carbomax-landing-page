// sections-2.jsx — second half of page sections + modals
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useT, CAR_BRANDS, fmtUZS } from './i18n.jsx'
import { Reveal, Logo, Section, rafThrottle } from './ui.jsx'
import { IMaskInput } from 'react-imask'

// ─── Gallery with lightbox ────────────────────────────────────────────────────
function Gallery({ locale }) {
  const t = useT(locale);
  const photos = [
    { ratio: "4/5", label: "Tikuv jarayoni — chexol tikilmoqda" },
    { ratio: "1/1", label: "Tayyor chexol — Cobalt salonida" },
    { ratio: "4/5", label: "Magicar o'rnatish jarayoni" },
    { ratio: "1/1", label: "Avval / keyin: K5 salon" },
    { ratio: "4/5", label: "Pol qoplamalarini tayyorlash — laser kesish" },
    { ratio: "1/1", label: "Ustalar jamoasi — 1998-yildan" },
    { ratio: "4/5", label: "Camry salon — premium chexol" },
    { ratio: "1/1", label: "Aksessuarlar ombori" },
  ];
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") setOpen((i) => (i + 1) % photos.length);
      else if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  return (
    <Section id="about" eyebrow="06 · Gallery" title={t("gallery.title")} sub={t("gallery.sub")}>
      <div style={{ columnCount: 3, columnGap: 16 }} className="cbx-masonry">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setOpen(i)}
            className="ph"
            style={{
              aspectRatio: p.ratio,
              width: "100%",
              marginBottom: 16,
              breakInside: "avoid",
              display: "flex",
              cursor: "pointer",
              border: "1px solid var(--border)",
              transition: "transform .2s ease, border-color .2s ease",
              padding: 0,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(0.99)"; e.currentTarget.style.borderColor = "color-mix(in oklab, var(--primary) 50%, var(--border))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; }}>
            <span style={{ position: "absolute", bottom: 12, left: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--fg-muted)", textTransform: "none", textAlign: "left" }}>
              {String(i + 1).padStart(2, "0")} · {p.label}
            </span>
          </button>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) { .cbx-masonry { column-count: 2 !important; } }
        @media (max-width: 560px) { .cbx-masonry { column-count: 1 !important; } }
      `}</style>

      {/* Lightbox */}
      {open !== null && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 40,
          }}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            aria-label="Close"
            style={{ position: "absolute", top: 20, right: 20, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, width: 40, height: 40, cursor: "pointer", fontSize: 18 }}>×</button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((i) => (i - 1 + photos.length) % photos.length); }}
            aria-label="Prev"
            style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, width: 48, height: 48, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 14 14"><path d="M9 3 L4 7 L9 11" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((i) => (i + 1) % photos.length); }}
            aria-label="Next"
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, width: 48, height: 48, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 14 14"><path d="M5 3 L10 7 L5 11" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="ph"
            style={{ width: "min(900px, 90vw)", aspectRatio: photos[open].ratio, background: "#1a1a1a", color: "#9a9a9a", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, fontFamily: "var(--font-mono)", fontSize: 13 }}>
            {photos[open].label}
          </div>
          <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em" }}>
            {String(open + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Our completed work / portfolio ───────────────────────────────────────────
function OurWork({ locale }) {
  const t = useT(locale);
  const items = t("ourWork.items");
  return (
    <Section eyebrow="07 · Portfolio" title={t("ourWork.title")} sub={t("ourWork.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cbx-work-grid">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="ph" style={{ aspectRatio: "4/3", borderRadius: 0, border: 0 }}>
                {item.car}
              </div>
              <div style={{ padding: "16px 20px 18px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 16, lineHeight: 1.3 }}>{item.car}</div>
                <div style={{ color: "var(--fg-muted)", fontSize: 13, marginTop: 2, lineHeight: 1.4 }}>{item.caption}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) { .cbx-work-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .cbx-work-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </Section>
  );
}

// ─── Services strip ───────────────────────────────────────────────────────────
function Services({ locale, onBook }) {
  const t = useT(locale);
  const items = t("services.items");
  // simple line icons
  const icons = [
    <svg key="0" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 L12 4 L21 11"/><path d="M5 10 L5 20 L19 20 L19 10"/><path d="M10 20 L10 14 L14 14 L14 20"/></svg>,
    <svg key="1" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6 L18 10 L9 19 L5 19 L5 15 Z"/><path d="M13 7 L11 5 L13 3 L19 9 L17 11"/></svg>,
    <svg key="2" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="12" height="9" rx="1"/><path d="M14 11 L18 11 L21 14 L21 17 L14 17"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>,
    <svg key="3" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5 L20 5 L20 16 L13 16 L9 20 L9 16 L4 16 Z"/></svg>,
    <svg key="4" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="16" height="14" rx="1"/><path d="M4 10 L20 10 M8 6 L8 4 M16 6 L16 4"/></svg>,
  ];
  return (
    <Section id="services" eyebrow="03 · Services" title={t("services.title")} sub={t("services.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="cbx-services-grid">
        {items.map((s, i) => (
          <Reveal key={i} delay={i * 60}>
            <div className="card" style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in oklab, var(--primary) 16%, transparent)", color: "var(--primary-bright)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icons[i]}
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 15, margin: "0 0 4px", lineHeight: 1.3 }}>{s.name}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: 13, margin: 0, lineHeight: 1.45 }}>{s.desc}</p>
              </div>
              <button
                onClick={() => onBook(s.name)}
                style={{
                  background: "transparent", border: 0, color: "var(--primary-bright)",
                  padding: 0, textAlign: "left", cursor: "pointer", fontSize: 12, fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                {s.cta}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`
        @media (max-width: 1100px) { .cbx-services-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 700px) { .cbx-services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 440px) { .cbx-services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </Section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function Process({ locale }) {
  const t = useT(locale);
  const steps = t("process.steps");
  return (
    <Section eyebrow="05 · Process" title={t("process.title")} sub={t("process.sub")}>
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="cbx-process-grid">
        {/* Connecting line (desktop) */}
        <div className="cbx-process-line" aria-hidden="true" style={{
          position: "absolute", top: 28, left: "12%", right: "12%", height: 1,
          background: "linear-gradient(90deg, transparent 0%, var(--border-strong) 12%, var(--border-strong) 88%, transparent 100%)"
        }}></div>
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 100}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "var(--bg)",
                border: "1px solid var(--border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 23, color: "var(--primary-bright)",
                position: "relative", zIndex: 2,
              }}>
                {i + 1}
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, margin: "0 0 8px", lineHeight: 1.05 }}>{s.title}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.55, margin: 0, maxWidth: 240 }}>{s.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`
        @media (max-width: 800px) {
          .cbx-process-grid { grid-template-columns: 1fr !important; }
          .cbx-process-line { display: none !important; }
        }
      `}</style>
    </Section>
  );
}

// ─── Car model selector ───────────────────────────────────────────────────────
function CarSelector({ locale, onFind }) {
  const t = useT(locale);
  const [brand, setBrand] = useState("");
  return (
    <Section eyebrow="08 · Match my car" title={t("selector.title")} sub={t("selector.sub")} alignHead="center">
      <Reveal>
        <form
          onSubmit={(e) => { e.preventDefault(); onFind && onFind({ brand }); }}
          className="glass"
          style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, maxWidth: 540, margin: "0 auto", alignItems: "center" }}>
          <div className="field">
            <select value={brand} onChange={(e) => setBrand(e.target.value)} required>
              <option value="" disabled>{t("selector.brand")}…</option>
              {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: 46 }}>
            {t("selector.cta")}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </form>
      </Reveal>
      <style>{`@media (max-width: 700px) {
        section form.glass { grid-template-columns: 1fr !important; }
      }`}</style>
    </Section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials({ locale }) {
  const t = useT(locale);
  const items = t("testimonials.items");
  return (
    <Section eyebrow="09 · Voices" title={t("testimonials.title")} sub={t("testimonials.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cbx-test-grid">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="card" style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                <path d="M4 16 C4 11 7 8 12 7 L12 10 C9 11 8 13 8 16 L12 16 L12 22 L4 22 Z M16 16 C16 11 19 8 24 7 L24 10 C21 11 20 13 20 16 L24 16 L24 22 L16 22 Z" fill="color-mix(in oklab, var(--primary) 40%, transparent)"/>
              </svg>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, lineHeight: 1.3, margin: 0, flexGrow: 1 }}>
                "{it.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "color-mix(in oklab, var(--primary) 25%, var(--surface-2))",
                  color: "var(--primary-bright)", fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid var(--border)",
                }}>{it.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{it.name}</div>
                  <div className="mono" style={{ color: "var(--fg-muted)", fontSize: 11 }}>{it.car}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2, color: "var(--accent)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 12 12"><path d="M6 1 L7.5 4.5 L11 5 L8.5 7.5 L9 11 L6 9.3 L3 11 L3.5 7.5 L1 5 L4.5 4.5 Z" fill="currentColor"/></svg>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) { .cbx-test-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </Section>
  );
}

// ─── Lead form ────────────────────────────────────────────────────────────────
function LeadForm({ locale, prefill, leadFormRef }) {
  const t = useT(locale);
  const [first, setFirst] = useState("");
  const [phone, setPhone] = useState("");
  const [cat, setCat] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (prefill && prefill.product) {
      setCat(prefill.product.cat === "covers" ? t("lead.catOptions")[0]
            : prefill.product.cat === "mats" ? t("lead.catOptions")[1]
            : prefill.product.cat === "acc" ? t("lead.catOptions")[2]
            : t("lead.catOptions")[3]);
      setNotes(`${prefill.product.name[locale]} (${prefill.product.sku})`);
    }
    if (prefill && prefill.brand) {
      setNotes(prev => prefill.brand + (prev ? `\n${prev}` : ""));
    }
  }, [prefill, locale, t]);

  return (
    <Section id="lead" eyebrow="10 · Get a quote" title={t("lead.title")} sub={t("lead.sub")} alignHead="center">
      <div ref={leadFormRef} style={{ maxWidth: 720, margin: "0 auto" }}>
        {sent ? (
          <Reveal>
            <div className="glass" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto 20px", borderRadius: "50%", background: "color-mix(in oklab, var(--primary) 25%, transparent)", color: "var(--primary-bright)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13 L9 17 L19 7"/></svg>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, lineHeight: 1.2 }}>{t("lead.success")}</div>
              <button onClick={() => setSent(false)} className="btn btn-ghost btn-sm" style={{ marginTop: 20 }}>↺ {t("lead.resend")}</button>
            </div>
          </Reveal>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="glass" style={{ padding: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>{t("lead.first")} <span style={{ color: "var(--accent)" }}>*</span></label>
              <input type="text" required value={first} onChange={(e) => setFirst(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>{t("lead.phone")} <span style={{ color: "var(--accent)" }}>*</span></label>
              <IMaskInput mask="+{998} (00) 000-00-00" value={phone} onAccept={(value) => setPhone(value)} placeholder="+998 (77) 013-07-07" type="tel" required />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>{t("lead.category")}</label>
              <select value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">—</option>
                {t("lead.catOptions").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>{t("lead.notes")}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="…" />
            </div>
            {/* honeypot */}
            <input type="text" name="company" autoComplete="off" tabIndex="-1"
                   style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} />
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 11 }}>
                ☟ {t("lead.formHint")}
              </div>
              <button type="submit" className="btn btn-primary">
                {t("lead.submit")}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <style>{`@media (max-width: 600px) {
              form.glass { grid-template-columns: 1fr !important; }
            }`}</style>
          </form>
        )}
      </div>
    </Section>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
function FAQ({ locale }) {
  const t = useT(locale);
  const items = t("faq.items");
  const [open, setOpen] = useState(0);
  return (
    <Section eyebrow="11 · FAQ" title={t("faq.title")}>
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid var(--border)" }}>
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={i} delay={i * 40}>
              <div style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{ width: "100%", background: "transparent", border: 0, color: "var(--fg)", textAlign: "left", padding: "22px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, font: "inherit" }}>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                    <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 11, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, lineHeight: 1.2 }}>{it.q}</span>
                  </span>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform .2s ease, background .2s ease, color .2s ease",
                    transform: isOpen ? "rotate(45deg)" : "none",
                    background: isOpen ? "var(--primary)" : "transparent",
                    color: isOpen ? "#0a120c" : "var(--fg-muted)",
                    flexShrink: 0,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2 L6 10 M2 6 L10 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  </span>
                </button>
                <div style={{
                  maxHeight: isOpen ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height .3s ease, padding .3s ease",
                  paddingBottom: isOpen ? 24 : 0,
                }}>
                  <p style={{ color: "var(--fg-muted)", fontSize: 15, lineHeight: 1.6, margin: 0, paddingLeft: 44, maxWidth: 720 }}>{it.a}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Contact + Telegram strip + Footer ────────────────────────────────────────
function Contact({ locale }) {
  const t = useT(locale);
  return (
    <Section id="contact" eyebrow="12 · Visit" title={t("contact.title")} sub={t("contact.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 32 }} className="cbx-contact-grid">
        <Reveal>
          <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("contact.addressLabel")}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, marginTop: 6, lineHeight: 1.25 }}>{t("contact.address")}</div>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("contact.phoneLabel")}</div>
              <a href="tel:+998770130707" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, marginTop: 6, lineHeight: 1.25, color: "var(--fg)", textDecoration: "none", display: "block" }}>+998 (77) 013-07-07</a>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("contact.hoursLabel")}</div>
              <div style={{ fontSize: 14, marginTop: 6, color: "var(--fg-muted)" }}>{t("contact.hours")}</div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>{t("contact.socialsLabel")}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { name: "Telegram", url: "https://t.me/CARBOMAX7" },
                  { name: "Instagram", url: "https://instagram.com/carbomax" },
                  { name: "Facebook", url: "https://facebook.com/carbomax" },
                  { name: "YouTube", url: "https://youtube.com/@carbomax" },
                ].map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 999, fontSize: 12, color: "var(--fg-muted)", textDecoration: "none" }}>{s.name}</a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          {/* Map placeholder — schematic */}
          <div style={{ position: "relative", aspectRatio: "16/10", borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <svg viewBox="0 0 600 400" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
              <defs>
                <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0 L0 0 L0 40" stroke="var(--border)" strokeWidth="0.5" fill="none"/>
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#map-grid)"/>
              <path d="M0 220 Q150 180 300 220 T600 240" stroke="color-mix(in oklab, var(--fg-dim) 60%, transparent)" strokeWidth="2" fill="none" opacity="0.5"/>
              <path d="M120 0 L120 400 M380 0 L380 400 M0 120 L600 120" stroke="var(--border-strong)" strokeWidth="1" opacity="0.5"/>
              <circle cx="320" cy="200" r="22" fill="color-mix(in oklab, var(--primary) 20%, transparent)"/>
              <circle cx="320" cy="200" r="8" fill="var(--primary-bright)"/>
              <circle cx="320" cy="200" r="3" fill="#fff"/>
              <text x="320" y="240" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)" letterSpacing="0.06em">CARBOMAX · TASHKENT</text>
            </svg>
            <div className="mono" style={{ position: "absolute", top: 16, left: 16, padding: "6px 10px", background: "color-mix(in oklab, var(--bg) 78%, transparent)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)" }}>
              ⌖ 41.2995°N · 69.2401°E
            </div>
          </div>
        </Reveal>
      </div>

      {/* Delivery regions */}
      <Reveal delay={200}>
        <div style={{ marginTop: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t("contact.regionsLabel")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {t("contact.regions").map(r => (
              <span key={r} style={{
                padding: "6px 14px", borderRadius: 999, border: "1px solid var(--border)",
                fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
              }}>{r}</span>
            ))}
          </div>
        </div>
      </Reveal>

      <style>{`@media (max-width: 900px) {
        .cbx-contact-grid { grid-template-columns: 1fr !important; }
      }`}</style>
    </Section>
  );
}

function TelegramStrip({ locale }) {
  const t = useT(locale);
  return (
    <section style={{ padding: "32px 0" }}>
      <div className="wrap">
        <Reveal>
          <div style={{
            padding: "40px 48px",
            borderRadius: "var(--r-lg)",
            background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 28%, var(--surface)) 0%, color-mix(in oklab, var(--primary) 8%, var(--surface)) 100%)",
            border: "1px solid color-mix(in oklab, var(--primary) 40%, var(--border))",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap",
            position: "relative", overflow: "hidden",
          }}>
            <div aria-hidden="true" style={{ position: "absolute", right: -40, bottom: -40, opacity: 0.08 }}>
              <svg width="280" height="280" viewBox="0 0 240 240"><path d="M120 20 L218 60 L195 175 Q188 215 144 205 L96 187 L96 158 L160 102 L78 152 L26 132 Q14 124 28 110 Z" fill="currentColor" color="var(--fg)"/></svg>
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(24px, 3vw, 34px)", lineHeight: 1.1, maxWidth: 560 }}>{t("telegram.title")}</div>
              <div style={{ color: "var(--fg-muted)", fontSize: 15, marginTop: 8 }}>{t("telegram.sub")}</div>
            </div>
            <a href="https://t.me/CARBOMAX7" className="btn btn-primary" style={{ position: "relative", zIndex: 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.5 6.5l-1.6 7.6c-.1.6-.5.7-1 .4l-2.7-2-1.3 1.2c-.2.2-.3.3-.6.3l.2-2.8 5-4.5c.2-.2-.1-.3-.3-.1L8 12.4l-2.7-.8c-.6-.2-.6-.6.1-.9l10.5-4c.5-.2.9.1.6 1z"/></svg>
              {t("telegram.cta")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer({ locale }) {
  const t = useT(locale);
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "64px 0 32px", marginTop: 40 }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }} className="cbx-footer-grid">
          <div>
            <Logo />
            <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.55, margin: "16px 0 0", maxWidth: 280 }}>{t("footer.tagline")}</p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{t("footer.site")}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["home", "products", "services", "about", "contact"].map(k => (
                <li key={k}><a href={`#${k}`} style={{ color: "var(--fg-muted)", textDecoration: "none", fontSize: 14 }}>{t(`nav.${k}`)}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{t("footer.services")}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {t("services.items").slice(0, 5).map((s, i) => (
                <li key={i} style={{ color: "var(--fg-muted)", fontSize: 14 }}>{s.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{t("footer.contact")}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ color: "var(--fg-muted)", fontSize: 14 }}>+998 (77) 013-07-07</li>
              <li style={{ color: "var(--fg-muted)", fontSize: 14 }}>hello@carbomax.net</li>
              <li style={{ color: "var(--fg-muted)", fontSize: 14 }}>@CARBOMAX7</li>
              <li style={{ color: "var(--fg-muted)", fontSize: 13, maxWidth: 220 }}>{t("contact.address")}</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--fg-dim)", fontFamily: "var(--font-mono)" }}>
          <div>{t("footer.copyright")}</div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>{t("footer.privacy")}</a>
            <a href="#" style={{ color: "var(--fg-dim)", textDecoration: "none" }}>{t("footer.terms")}</a>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 800px) {
        .cbx-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px 24px !important; }
      } @media (max-width: 500px) {
        .cbx-footer-grid { grid-template-columns: 1fr !important; }
      }`}</style>
    </footer>
  );
}

// ─── Floating action buttons ──────────────────────────────────────────────────
function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = rafThrottle(() => setShowTop(window.scrollY > 400));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const btn = (color, label, href, svg) => {
    const external = href.startsWith("http");
    return (
      <a href={href} title={label} aria-label={label}
         target={external ? "_blank" : undefined}
         rel={external ? "noopener noreferrer" : undefined}
         style={{
           width: 48, height: 48, borderRadius: "50%",
           background: color, color: "#fff",
           display: "flex", alignItems: "center", justifyContent: "center",
           boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
           textDecoration: "none",
           transition: "transform .15s ease",
         }}
         onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
         onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
        {svg}
      </a>
    );
  };
  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 30, display: "flex", flexDirection: "column", gap: 10 }}>
      {btn("#0088cc", "Telegram", "https://t.me/CARBOMAX7",
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 14.5 L9.3 17.5 c.4 0 .6-.2.8-.4l1.9-1.8 4 2.9 c.7.4 1.3.2 1.5-.7l2.7-12.7 c.3-1.2-.4-1.7-1.1-1.4L2.5 9.4 c-1.1.5-1.1 1-.2 1.3l4.4 1.4 10.2-6.5 c.5-.3.9-.1.5.2"/></svg>)}
      {btn("var(--primary)", "Phone", "tel:+998770130707",
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9 v3 a2 2 0 0 1 -2.2 2 a 19.8 19.8 0 0 1 -8.6 -3.1 a 19.5 19.5 0 0 1 -6 -6 a 19.8 19.8 0 0 1 -3.1 -8.7 A2 2 0 0 1 4.1 2 h3 a2 2 0 0 1 2 1.7 a 12.8 12.8 0 0 0 .7 2.8 a2 2 0 0 1 -.5 2.1 L8 9.9 a16 16 0 0 0 6 6 l1.3 -1.3 a2 2 0 0 1 2.1 -.5 a 12.8 12.8 0 0 0 2.8 .7 A2 2 0 0 1 22 16.9 z"/></svg>)}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"
                style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border-strong)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 9 L7 5 L11 9" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
    </div>
  );
}

// ─── Booking modal ────────────────────────────────────────────────────────────
function BookingModal({ locale, open, defaultService, onClose }) {
  const t = useT(locale);
  const [form, setForm] = useState({ service: "", date: "", time: "", name: "", phone: "", notes: "" });
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(f => ({ ...f, service: defaultService || "" }));
      setSent(false);
    }
  }, [open, defaultService]);
  if (!open) return null;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: "var(--surface)", padding: 32, width: "100%", maxWidth: 480, position: "relative", maxHeight: "92vh", overflowY: "auto" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: 0, color: "var(--fg-muted)", cursor: "pointer", fontSize: 20, width: 32, height: 32, borderRadius: 999 }}>×</button>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 20px", borderRadius: "50%", background: "color-mix(in oklab, var(--primary) 25%, transparent)", color: "var(--primary-bright)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13 L9 17 L19 7"/></svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, lineHeight: 1.2 }}>{t("booking.success")}</div>
            <button onClick={onClose} className="btn btn-primary btn-sm" style={{ marginTop: 24 }}>OK</button>
          </div>
        ) : (
          <>
            <div className="eyebrow" style={{ fontSize: 10 }}>06 · Booking</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 29, lineHeight: 1.1, marginTop: 6 }}>{t("booking.title")}</div>
            <div style={{ color: "var(--fg-muted)", fontSize: 14, marginTop: 8 }}>{t("booking.sub")}</div>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="field">
                <label>{t("booking.service")}</label>
                <input type="text" value={form.service} onChange={(e) => upd("service", e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field"><label>{t("booking.date")}</label><input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} required /></div>
                <div className="field"><label>{t("booking.time")}</label><input type="time" value={form.time} onChange={(e) => upd("time", e.target.value)} required /></div>
              </div>
              <div className="field"><label>{t("booking.name")}</label><input type="text" value={form.name} onChange={(e) => upd("name", e.target.value)} required /></div>
              <div className="field"><label>{t("booking.phone")}</label><IMaskInput mask="+{998} (00) 000-00-00" value={form.phone} onAccept={(value) => upd("phone", value)} placeholder="+998 (XX) XXX-XX-XX" type="tel" required /></div>
              <div className="field"><label>{t("booking.notes")}</label><textarea value={form.notes} onChange={(e) => upd("notes", e.target.value)} /></div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>{t("booking.cancel")}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>{t("booking.submit")}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export { Gallery, OurWork, Services, Process, CarSelector, Testimonials, LeadForm, FAQ, Contact, TelegramStrip, Footer, FloatingActions, BookingModal }
