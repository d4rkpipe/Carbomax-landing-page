// Admin shell — auth + section menu + routing between managers.
import React, { useState, useEffect, useCallback } from 'react'
import { api, getToken, saveToken } from './lib.js'
import { Center, Toast } from './ui.jsx'
import CatalogManager from './CatalogManager.jsx'
import LoyaltyManager from './LoyaltyManager.jsx'
import PortfolioManager from './PortfolioManager.jsx'
import LeadsManager from './LeadsManager.jsx'

const SECTION_TITLES = { menu: 'Boshqaruv paneli', catalog: 'Katalog', loyalty: 'Keshbek tizimi', portfolio: 'Portfolio', leads: 'Murojaatlar' }

export default function Admin() {
  const [token, setToken] = useState(getToken)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState('menu')   // 'menu' | 'catalog' | 'loyalty'
  const [toast, setToast] = useState(null)

  const notify = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 3200)
  }, [])

  // Validate any stored token before showing the dashboard.
  useEffect(() => {
    if (!token) { setReady(true); return }
    let alive = true
    api('/auth/me', { token })
      .catch(() => { if (alive) { saveToken(''); setToken('') } })
      .finally(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [token])

  const logout = () => { saveToken(''); setToken(''); setView('menu') }

  if (!ready) return <Center>Yuklanmoqda…</Center>
  if (!token) return <Login onLogin={(t) => { saveToken(t); setToken(t) }} />

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar view={view} onHome={() => setView('menu')} onLogout={logout} />
      <div className="wrap" style={{ maxWidth: 1100, padding: '28px 32px 80px' }}>
        {view === 'menu' && <Menu onOpen={setView} token={token} />}
        {view === 'catalog' && <CatalogManager token={token} notify={notify} />}
        {view === 'loyalty' && <LoyaltyManager token={token} notify={notify} />}
        {view === 'portfolio' && <PortfolioManager token={token} notify={notify} />}
        {view === 'leads' && <LeadsManager token={token} notify={notify} />}
      </div>
      {toast && <Toast {...toast} />}
      <style>{`@media (max-width: 760px) {
        .adm-row { flex-wrap: wrap !important; }
        .adm-row .adm-grow { flex-basis: 60% !important; }
        .adm-row .adm-actions { flex-basis: 100% !important; justify-content: flex-end; }
      }
      @media (max-width: 640px) { .adm-menu { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function TopBar({ view, onHome, onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      borderBottom: '1px solid var(--border)',
      background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div className="wrap" style={{ maxWidth: 1100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
          <button onClick={onHome} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--fg)' }}>Carbomax</button>
          {view !== 'menu' && (
            <>
              <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>/</span>
              <span className="mono" style={{ color: 'var(--fg-muted)', fontSize: 13 }}>{SECTION_TITLES[view]}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {view !== 'menu' && <button className="btn btn-ghost btn-sm" onClick={onHome}>← Bo'limlar</button>}
          <a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noreferrer">Saytni ko'rish</a>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Chiqish</button>
        </div>
      </div>
    </header>
  )
}

function Menu({ onOpen, token }) {
  const [counts, setCounts] = useState({ catalog: null, loyalty: null, portfolio: null, leads: null })
  useEffect(() => {
    Promise.all([api('/products'), api('/loyalty'), api('/portfolio'), api('/leads', { token })])
      .then(([p, l, pf, ld]) => setCounts({ catalog: p.length, loyalty: l.length, portfolio: pf.length, leads: ld.length }))
      .catch(() => {})
  }, [token])
  const cards = [
    { id: 'catalog', title: 'Katalog', desc: "Mahsulotlar va kategoriyalar — qo'shish, tahrirlash, rasm, tartiblash.", count: counts.catalog, unit: 'mahsulot' },
    { id: 'loyalty', title: 'Keshbek tizimi', desc: "Keshbek pog'onalari, foizlari va shartlari.", count: counts.loyalty, unit: "pog'ona" },
    { id: 'portfolio', title: 'Portfolio', desc: '“Biz qilgan ishlar” — avtomobil ishlari va rasmlari.', count: counts.portfolio, unit: 'ish' },
    { id: 'leads', title: 'Murojaatlar', desc: 'Saytdagi formalardan kelgan so‘rov va vaqt belgilashlar.', count: counts.leads, unit: 'murojaat' },
  ]
  return (
    <>
      <h1 className="display" style={{ fontSize: 26, margin: '4px 0 20px' }}>Boshqaruv paneli</h1>
      <div className="adm-menu" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} className="card"
            style={{ textAlign: 'left', cursor: 'pointer', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180, color: 'var(--fg)', transition: 'transform .15s ease, border-color .15s ease, background .15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--primary) 50%, var(--border))'; e.currentTarget.style.background = 'color-mix(in oklab, var(--primary) 4%, var(--surface))' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = '' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, margin: 0 }}>{c.title}</h2>
              <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 12 }}>{c.count == null ? '…' : `${c.count} ta ${c.unit}`}</span>
            </div>
            <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: 0, lineHeight: 1.5, flexGrow: 1 }}>{c.desc}</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary-bright)', fontSize: 14, fontWeight: 500 }}>
              Boshqarish
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { username: u, password: p } })
      onLogin(token)
    } catch (e) { setErr(e.message); setBusy(false) }
  }
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 20 }}>
      <form onSubmit={submit} className="glass" style={{ padding: 32, width: '100%', maxWidth: 360 }}>
        <div className="eyebrow" style={{ fontSize: 10 }}>Carbomax</div>
        <h1 className="display" style={{ fontSize: 28, margin: '6px 0 22px' }}>Admin panel</h1>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Login</label>
          <input value={u} onChange={(e) => setU(e.target.value)} autoFocus required />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Parol</label>
          <input type="password" value={p} onChange={(e) => setP(e.target.value)} required />
        </div>
        {err && <div style={{ color: '#e5484d', fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Kirilmoqda…' : 'Kirish'}
        </button>
      </form>
    </div>
  )
}
