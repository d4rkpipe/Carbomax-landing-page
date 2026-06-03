// sections-2.jsx — second half of page sections + modals
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useT } from './i18n.jsx'
import { Reveal, Logo, Section, rafThrottle } from './ui.jsx'
import { IMaskInput } from 'react-imask'

// ─── Our completed work / portfolio ───────────────────────────────────────────
function OurWork({ locale }) {
  const t = useT(locale);
  // Portfolio comes from the admin-managed API; the i18n list is the fallback.
  const fallback = t("ourWork.items");
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/portfolio")
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (alive && Array.isArray(d) && d.length) setRows(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const L = locale.charAt(0).toUpperCase() + locale.slice(1);
  const items = useMemo(() => {
    if (rows) return rows.map(r => ({ car: r.carName, caption: r["caption" + L] || r.captionUz, imageUrl: r.imageUrl || null }));
    return fallback;
  }, [rows, L, fallback]);
  return (
    <Section id="about" eyebrow="06 · Portfolio" title={t("ourWork.title")} sub={t("ourWork.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cbx-work-grid">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.car} loading="lazy"
                  style={{ aspectRatio: "4/3", width: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div className="ph" style={{ aspectRatio: "4/3", borderRadius: 0, border: 0 }}>
                  {item.car}
                </div>
              )}
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
  const [model, setModel] = useState("");
  return (
    <Section eyebrow="07 · Match my car" title={t("selector.title")} sub={t("selector.sub")} alignHead="center">
      <Reveal>
        <form
          onSubmit={(e) => { e.preventDefault(); onFind && onFind({ model }); }}
          className="glass"
          style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, maxWidth: 540, margin: "0 auto", alignItems: "center" }}>
          <div className="field">
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
              placeholder={t("selector.placeholder")} required />
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
    <Section eyebrow="08 · Voices" title={t("testimonials.title")} sub={t("testimonials.sub")}>
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
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const company = e.currentTarget.company ? e.currentTarget.company.value : ""; // honeypot
    setErr("");
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quote", name: first, phone, topic: cat, notes, company }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch (e2) {
      setErr(t("common.error"));
    } finally {
      setSending(false);
    }
  };

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
    <Section id="lead" eyebrow="09 · Get a quote" title={t("lead.title")} sub={t("lead.sub")} alignHead="center">
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
            onSubmit={submit}
            className="glass" style={{ padding: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>{t("lead.first")} <span style={{ color: "var(--accent)" }}>*</span></label>
              <input type="text" required value={first} onChange={(e) => setFirst(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>{t("lead.phone")} <span style={{ color: "var(--accent)" }}>*</span></label>
              <IMaskInput mask="+{998} (00) 000-00-00" value={phone} onAccept={(value) => setPhone(value)} placeholder="+99890 1234567" type="tel" required />
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
            {err && <div style={{ gridColumn: "1 / -1", color: "#e5484d", fontSize: 13, marginTop: 4 }}>{err}</div>}
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 11 }}>
                ☟ {t("lead.formHint")}
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? t("common.sending") : t("lead.submit")}
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
    <Section eyebrow="10 · FAQ" title={t("faq.title")}>
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
const SOCIAL_ICONS = {
  telegram: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M9.8 14.6l-.35 4.2c.5 0 .72-.22.98-.48l2.35-2.25 4.87 3.57c.9.5 1.53.24 1.77-.82l3.2-15.04c.29-1.32-.48-1.84-1.34-1.52L1.5 9.36c-1.3.5-1.28 1.22-.22 1.55l4.9 1.53L17.5 5.6c.54-.36 1.03-.16.63.2"/></svg>,
  instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>,
  facebook: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5H16l.5-3h-3V8.7c0-.85.3-1.4 1.5-1.4H16.6V4.6C16.2 4.55 15.2 4.5 14.1 4.5c-2.3 0-3.85 1.4-3.85 3.95V10.5H7.7v3h2.55V21z"/></svg>,
  youtube: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2c-.24-1.06-.83-1.66-1.86-1.86C18.34 6 12 6 12 6s-6.34 0-8.14.34C2.83 6.54 2.24 7.14 2 8.2 1.66 10 1.66 12 1.66 12s0 2 .34 3.8c.24 1.06.83 1.66 1.86 1.86C5.66 18 12 18 12 18s6.34 0 8.14-.34c1.03-.2 1.62-.8 1.86-1.86.34-1.8.34-3.8.34-3.8s0-2-.34-3.8zM10 15V9l5.2 3z"/></svg>,
};

function Contact({ locale }) {
  const t = useT(locale);
  const L = locale.charAt(0).toUpperCase() + locale.slice(1); // "Uz" | "Ru" | "En"
  const [rows, setRows] = useState(null);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch("/api/branches")
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (alive && Array.isArray(d) && d.length) setRows(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Fallback single branch (matches the old hard-coded content) until the API
  // resolves, and on static hosting.
  const fallback = useMemo(() => ([{
    name: "Carbomax", address: t("contact.address"), phone: "+998 (77) 013-07-07",
    days: ["09:00 - 19:00", "09:00 - 19:00", "09:00 - 19:00", "09:00 - 19:00", "09:00 - 19:00", "09:00 - 19:00", "10:00 - 17:00"],
    lat: "41.2230", lng: "69.2206",
    telegram: "https://t.me/CARBOMAX7", instagram: "https://instagram.com/carbomax",
    facebook: "https://facebook.com/carbomax", youtube: "https://youtube.com/@carbomax",
  }]), [t]);

  const list = useMemo(() => (rows
    ? rows.map(b => ({
        name: b.name, address: b["address" + L] || b.addressUz, phone: b.phone,
        days: [b.hoursMon, b.hoursTue, b.hoursWed, b.hoursThu, b.hoursFri, b.hoursSat, b.hoursSun],
        lat: b.lat, lng: b.lng, telegram: b.telegram, instagram: b.instagram, facebook: b.facebook, youtube: b.youtube,
      }))
    : fallback), [rows, L, fallback]);

  const b = list[Math.min(idx, list.length - 1)] || list[0];
  const tel = "tel:" + String(b.phone || "").replace(/[^\d+]/g, "");
  const socials = [
    { key: "telegram", label: "Telegram", url: b.telegram },
    { key: "instagram", label: "Instagram", url: b.instagram },
    { key: "facebook", label: "Facebook", url: b.facebook },
    { key: "youtube", label: "YouTube", url: b.youtube },
  ].filter(s => s.url);
  const mapSrc = `https://yandex.com/map-widget/v1/?ll=${encodeURIComponent(b.lng)}%2C${encodeURIComponent(b.lat)}&z=16&pt=${b.lng},${b.lat},pm2rdm`;
  const mapLink = `https://yandex.com/maps/?ll=${b.lng},${b.lat}&z=16&pt=${b.lng},${b.lat}`;

  return (
    <Section id="contact" eyebrow="11 · Visit" title={t("contact.title")}>
      {list.length > 1 && (
        <Reveal>
          <div className="field" style={{ maxWidth: 360, marginBottom: 24 }}>
            <label>{t("contact.branchLabel")}</label>
            <select value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
              {list.map((x, i) => <option key={i} value={i}>{x.name}</option>)}
            </select>
          </div>
        </Reveal>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="cbx-contact-grid">
        <Reveal>
          <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("contact.addressLabel")}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, marginTop: 6, lineHeight: 1.25 }}>{b.address}</div>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("contact.phoneLabel")}</div>
              <a href={tel} style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, marginTop: 6, lineHeight: 1.25, color: "var(--fg)", textDecoration: "none", display: "block" }}>{b.phone}</a>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{t("contact.hoursLabel")}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, maxWidth: 300 }}>
                {t("contact.days").map((day, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13.5 }}>
                    <span style={{ color: "var(--fg-muted)" }}>{day}</span>
                    <span className="tnum" style={{ color: b.days[i] ? "var(--fg)" : "var(--fg-dim)" }}>{b.days[i] || t("contact.closed")}</span>
                  </div>
                ))}
              </div>
            </div>
            {socials.length > 0 && (
              <div style={{ marginTop: "auto" }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>{t("contact.socialsLabel")}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {socials.map((s) => (
                    <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label} aria-label={s.label}
                       style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)", textDecoration: "none", transition: "color .2s, border-color .2s, background .2s" }}
                       onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary-bright)"; e.currentTarget.style.borderColor = "color-mix(in oklab, var(--primary) 50%, var(--border))"; }}
                       onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                      {SOCIAL_ICONS[s.key]}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={120} style={{ display: "flex" }}>
          {/* Yandex map — static (pointer-events disabled so it can't be dragged/zoomed) */}
          <div style={{ position: "relative", flex: 1, minHeight: 360, borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <iframe
              title={b.name}
              src={mapSrc}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, display: "block", pointerEvents: "none" }}
              loading="lazy"
            />
            <div className="mono" style={{ position: "absolute", top: 16, left: 16, padding: "6px 10px", background: "color-mix(in oklab, var(--bg) 78%, transparent)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", pointerEvents: "none" }}>
              ⌖ {b.lat}°N · {b.lng}°E
            </div>
            <a href={mapLink} target="_blank" rel="noopener noreferrer"
               style={{ position: "absolute", bottom: 16, right: 16, padding: "8px 14px", background: "color-mix(in oklab, var(--bg) 82%, transparent)", border: "1px solid var(--border-strong)", borderRadius: 999, fontSize: 12, color: "var(--fg)", textDecoration: "none", backdropFilter: "blur(8px)" }}>
              Yandex'da ochish ↗
            </a>
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
            <a href="https://t.me/Carbomax_uz" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ position: "relative", zIndex: 1 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, color: "var(--fg)" }}>Carbomax</span>
            </div>
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
              <li style={{ color: "var(--fg-muted)", fontSize: 14 }}>admin@carbomax.net</li>
              <li style={{ color: "var(--fg-muted)", fontSize: 13, maxWidth: 220 }}>{t("contact.address")}</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px 24px", flexWrap: "wrap", fontSize: 12, color: "var(--fg-dim)", fontFamily: "var(--font-mono)" }}>
          <div>{t("footer.copyright")}</div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <span>
              {t("footer.builtBy")}{" "}
              <a href="https://t.me/nozimjon_hamdamov" target="_blank" rel="noopener noreferrer"
                 style={{ color: "var(--fg-muted)", textDecoration: "none", borderBottom: "1px dashed var(--border-strong)", paddingBottom: 1 }}>
                Nozimjon Hamdamov
              </a>
            </span>
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
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) {
      setForm(f => ({ ...f, service: defaultService || "" }));
      setSent(false);
      setErr("");
    }
  }, [open, defaultService]);
  if (!open) return null;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSending(true);
    try {
      const schedule = [form.date, form.time].filter(Boolean).join(" ");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "booking", name: form.name, phone: form.phone, topic: form.service, schedule, notes: form.notes }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch (e2) {
      setErr(t("common.error"));
    } finally {
      setSending(false);
    }
  };
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
            <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
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
              {err && <div style={{ color: "#e5484d", fontSize: 13 }}>{err}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>{t("booking.cancel")}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={sending}>{sending ? t("common.sending") : t("booking.submit")}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export { OurWork, Services, Process, CarSelector, Testimonials, LeadForm, FAQ, Contact, TelegramStrip, Footer, FloatingActions, BookingModal }
