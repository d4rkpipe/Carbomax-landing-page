// Loyalty manager — cashback-tier CRUD.
import React, { useState, useEffect, useCallback } from 'react'
import { api } from './lib.js'
import { Field, Center, IconBtn, DeleteBtn, ManagerHeader, Overlay } from './ui.jsx'

const ACCENT_PRESETS = ['#c4ccc0', '#a8d8ec', '#f5b023', '#45b958', '#7aa2f7', '#e06c9f']
const EMPTY = {
  name: '', percent: '', accent: '#c4ccc0',
  descUz: '', descRu: '', descEn: '',
  thresholdUz: '', thresholdRu: '', thresholdEn: '',
}

// Same accent-derived card colours the public site uses, so the preview matches.
const cardBg = (a) => `linear-gradient(160deg, color-mix(in oklab, ${a} 22%, var(--surface)) 0%, color-mix(in oklab, ${a} 7%, var(--bg)) 100%)`
const cardRing = (a) => `color-mix(in oklab, ${a} 45%, var(--border))`

export default function LoyaltyManager({ token, notify }) {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const reordering = React.useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setTiers(await api('/loyalty')) }
    catch (e) { notify(e.message, 'err') }
    finally { setLoading(false) }
  }, [notify])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (form.id) {
      const updated = await api(`/loyalty/${form.id}`, { method: 'PUT', body: form, token })
      setTiers((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))
      notify('Pog\'ona yangilandi')
    } else {
      const created = await api('/loyalty', { method: 'POST', body: { ...form, displayOrder: tiers.length }, token })
      setTiers((ts) => [...ts, created])
      notify("Pog'ona qo'shildi")
    }
    setEditing(null)
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`"${t.name}" pog'onasi o'chirilsinmi?`)) return
    try {
      await api(`/loyalty/${t.id}`, { method: 'DELETE', token })
      setTiers((ts) => ts.filter((x) => x.id !== t.id))
      notify("Pog'ona o'chirildi")
    } catch (e) { notify(e.message, 'err') }
  }

  const move = async (index, dir) => {
    if (reordering.current) return
    const j = index + dir
    if (j < 0 || j >= tiers.length) return
    const next = tiers.slice()
    ;[next[index], next[j]] = [next[j], next[index]]
    setTiers(next)
    reordering.current = true
    try { await api('/loyalty/reorder', { method: 'PUT', body: { ids: next.map((t) => t.id) }, token }) }
    catch (e) { notify(e.message, 'err'); load() }
    finally { reordering.current = false }
  }

  return (
    <>
      <ManagerHeader title="Keshbek tizimi" count={tiers.length} unit="pog'ona"
        addLabel="+ Yangi pog'ona" onAdd={() => setEditing({ ...EMPTY })} />
      {loading
        ? <Center>Yuklanmoqda…</Center>
        : tiers.length === 0
          ? <Center>Hozircha pog'ona yo'q. “+ Yangi pog'ona” tugmasini bosing.</Center>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tiers.map((t, i) => (
                <div key={t.id} className="card adm-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, border: `1px solid ${cardRing(t.accent)}`, background: cardBg(t.accent), display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: t.accent }}>
                    {t.percent}
                  </div>
                  <div className="adm-grow" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{t.name} <span className="mono" style={{ color: t.accent, fontSize: 12 }}>{t.percent}</span></div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descUz} · <span style={{ color: 'var(--fg-dim)' }}>{t.thresholdUz}</span></div>
                  </div>
                  <div className="adm-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <IconBtn title="Yuqoriga" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconBtn>
                    <IconBtn title="Pastga" disabled={i === tiers.length - 1} onClick={() => move(i, 1)}>↓</IconBtn>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(t)}>Tahrirlash</button>
                    <DeleteBtn onClick={() => handleDelete(t)} />
                  </div>
                </div>
              ))}
            </div>
          )}
      {editing && (
        <TierForm initial={editing} onCancel={() => setEditing(null)}
          onSave={handleSave} onError={(m) => notify(m, 'err')} />
      )}
    </>
  )
}

function TierForm({ initial, onCancel, onSave, onError }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [busy, setBusy] = useState(false)
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try { await onSave(form) }
    catch (err) { onError(err.message); setBusy(false) }
  }

  return (
    <Overlay onClose={onCancel}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="card"
        style={{ background: 'var(--surface)', padding: 28, width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="display" style={{ fontSize: 22, margin: 0 }}>{form.id ? "Pog'onani tahrirlash" : "Yangi pog'ona"}</h2>
          <button type="button" onClick={onCancel} aria-label="Yopish"
            style={{ background: 'transparent', border: 0, color: 'var(--fg-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Live preview — matches the public card */}
        <div style={{ padding: '18px 20px', borderRadius: 'var(--r-lg)', background: cardBg(form.accent), border: `1px solid ${cardRing(form.accent)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: form.accent }}>{form.name || 'Nom'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 34, color: form.accent, lineHeight: 1 }}>{form.percent || '0%'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Field label="Nomi" required>
            <input value={form.name} onChange={(e) => upd('name', e.target.value)} placeholder="Regular / Silver / Gold" required autoFocus />
          </Field>
          <Field label="Foiz" required>
            <input value={form.percent} onChange={(e) => upd('percent', e.target.value)} placeholder="5%" required />
          </Field>
        </div>

        <Field label="Rang">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {ACCENT_PRESETS.map((c) => (
              <button type="button" key={c} title={c} onClick={() => upd('accent', c)}
                style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer', border: form.accent.toLowerCase() === c.toLowerCase() ? '2px solid var(--fg)' : '1px solid var(--border)' }} />
            ))}
            <input type="color" value={form.accent} onChange={(e) => upd('accent', e.target.value)}
              style={{ width: 36, height: 28, padding: 0, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer' }} />
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{form.accent}</span>
          </div>
        </Field>

        <Field label="Tavsif (o'zbekcha)" required>
          <input value={form.descUz} onChange={(e) => upd('descUz', e.target.value)} placeholder="Har bir mijoz uchun." required />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Tavsif (ruscha)"><input value={form.descRu} onChange={(e) => upd('descRu', e.target.value)} /></Field>
          <Field label="Tavsif (inglizcha)"><input value={form.descEn} onChange={(e) => upd('descEn', e.target.value)} /></Field>
        </div>

        <Field label="Shart (o'zbekcha)">
          <input value={form.thresholdUz} onChange={(e) => upd('thresholdUz', e.target.value)} placeholder="5 000 000 so'm xariddan keyin" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Shart (ruscha)"><input value={form.thresholdRu} onChange={(e) => upd('thresholdRu', e.target.value)} /></Field>
          <Field label="Shart (inglizcha)"><input value={form.thresholdEn} onChange={(e) => upd('thresholdEn', e.target.value)} /></Field>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.4 }} disabled={busy}>
            {busy ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        </div>
      </form>
    </Overlay>
  )
}
