// App.jsx — main composition, state, tweaks
import React from 'react'
import { PromoBanner, Header, Hero, Stats, Categories, Products, Loyalty } from './sections.jsx'
import { Services, Process, OurWork, CarSelector, Testimonials, LeadForm, FAQ, Contact, TelegramStrip, Footer, FloatingActions, BookingModal } from './sections-2.jsx'
import { TweaksPanel, TweakSection, TweakRadio, TweakColor, useTweaks } from './tweaks-panel.jsx'

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "primary": "#2f8a3e",
  "primaryBright": "#45b958",
  "heroVariant": "split",
  "density": "regular"
}/*EDITMODE-END*/;

const PRIMARY_OPTIONS = [
  // [primary, primary-bright]
  ["#2f8a3e", "#45b958"], // Carbomax green
  ["#1e40af", "#3b82f6"], // CRM deep blue
  ["#c87a0a", "#f5b023"], // amber-led
];

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [locale, setLocale] = React.useState(() => {
    try {
      const saved = localStorage.getItem("cbx_locale");
      if (saved && ["uz", "ru", "en"].includes(saved)) return saved;
      const nav = (navigator.language || "uz").slice(0, 2);
      if (nav === "ru") return "ru";
      if (nav === "en") return "en";
    } catch (e) {}
    return "uz";
  });
  React.useEffect(() => { try { localStorage.setItem("cbx_locale", locale); } catch (e) {} }, [locale]);

  // Dynamic <title>, <meta description> and <html lang> per locale (for SEO and browser tab)
  React.useEffect(() => {
    const titles = {
      uz: "Carbomax — Avtomobil chexollari va aksessuarlar do'koni · Toshkent",
      ru: "Carbomax — Магазин автомобильных чехлов и аксессуаров · Ташкент",
      en: "Carbomax — Auto seat-cover and accessory shop · Tashkent",
    };
    const descs = {
      uz: "Carbomax — Toshkentdagi avtomobil chexollari va aksessuarlar do'koni. Qo'lda tikilgan chexollar, pollik qoplamalari, Magicar signalizatsiyalari. 1998-yildan beri.",
      ru: "Carbomax — Магазин автомобильных чехлов и аксессуаров в Ташкенте. Чехлы ручной работы, коврики, сигнализации Magicar. С 1998 года.",
      en: "Carbomax — Auto seat-cover, floor mat and accessory shop in Tashkent. Hand-tailored covers, Magicar alarms. Since 1998.",
    };
    document.title = titles[locale] || titles.uz;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descs[locale] || descs.uz);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [bookingService, setBookingService] = React.useState("");
  const [prefill, setPrefill] = React.useState(null);
  const leadFormRef = React.useRef(null);

  // Apply tweaks to root + theme on body
  React.useEffect(() => {
    document.body.setAttribute("data-theme", tw.theme);
    document.body.setAttribute("data-density", tw.density);
    document.documentElement.style.setProperty("--primary", tw.primary);
    document.documentElement.style.setProperty("--primary-bright", tw.primaryBright);
  }, [tw.theme, tw.density, tw.primary, tw.primaryBright]);

  const handleBook = (serviceName) => {
    setBookingService(serviceName);
    setBookingOpen(true);
  };
  const handleAddInquiry = (product) => {
    setPrefill({ product });
    setTimeout(() => {
      if (leadFormRef.current) {
        const y = leadFormRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 80);
  };
  // Car selector sends the visitor to the "Get a quote" lead form, with the
  // typed car model pre-filled into the request notes.
  const handleCarFind = (data) => {
    setPrefill({ brand: (data && data.model) || "" });
    setTimeout(() => {
      if (leadFormRef.current) {
        const y = leadFormRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 80);
  };
  const handleGetTouchCta = () => {
    if (leadFormRef.current) {
      const y = leadFormRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // current primary palette index
  const palIdx = PRIMARY_OPTIONS.findIndex(p => p[0].toLowerCase() === (tw.primary || "").toLowerCase());

  return (
    <div>
      <PromoBanner locale={locale} />
      <Header
        locale={locale} setLocale={setLocale}
        theme={tw.theme} setTheme={(v) => setTweak("theme", v)}
        onCta={handleGetTouchCta}
      />
      <Hero locale={locale} variant={tw.heroVariant} onCta={handleGetTouchCta} />
      <Stats locale={locale} />
      <Categories locale={locale} />
      <Products locale={locale} onAddInquiry={handleAddInquiry} />
      <Services locale={locale} onBook={handleBook} />
      <Loyalty locale={locale} />
      <Process locale={locale} />
      <OurWork locale={locale} />
      <CarSelector locale={locale} onFind={handleCarFind} />
      <Testimonials locale={locale} />
      <LeadForm locale={locale} prefill={prefill} leadFormRef={leadFormRef} />
      <FAQ locale={locale} />
      <Contact locale={locale} />
      <TelegramStrip locale={locale} />
      <Footer locale={locale} />
      <FloatingActions />

      <BookingModal
        locale={locale}
        open={bookingOpen}
        defaultService={bookingService}
        onClose={() => setBookingOpen(false)}
      />

      <TweaksPanel title="Carbomax tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={tw.theme}
          options={["dark", "light"]}
          onChange={(v) => setTweak("theme", v)} />
        <TweakColor label="Primary" value={tw.primary}
          options={PRIMARY_OPTIONS.map(p => p[0])}
          onChange={(v) => {
            const pair = PRIMARY_OPTIONS.find(p => p[0] === v) || [v, v];
            setTweak({ primary: pair[0], primaryBright: pair[1] });
          }} />
        <div style={{ fontSize: 10.5, color: "rgba(0,0,0,0.45)", marginTop: -4, marginBottom: 2, lineHeight: 1.35 }}>
          {palIdx === 0 ? "Carbomax green (default)" : palIdx === 1 ? "CRM deep blue" : palIdx === 2 ? "Amber" : "Custom"}
        </div>

        <TweakSection label="Layout" />
        <TweakRadio label="Hero variant" value={tw.heroVariant}
          options={["split", "centered", "image-first"]}
          onChange={(v) => setTweak("heroVariant", v)} />
        <TweakRadio label="Density" value={tw.density}
          options={["compact", "regular", "spacious"]}
          onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

export default App
