// Portfolio manager — "Biz qilgan ishlar" CRUD + image upload.
import React, { useState, useEffect, useCallback } from 'react'
import { api } from './lib.js'
import { Field, Center, IconBtn, DeleteBtn, ManagerHeader, Overlay, ImageUploader } from './ui.jsx'

const EMPTY = { carName: '', captionUz: '', captionRu: '', captionEn: '', imageUrl: '' }

export default function PortfolioManager({ token, notify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await api('/portfolio')) }
    catch (e) { notify(e.message, 'err') }
    finally { setLoading(false) }
  }, [notify])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (form.id) {
      const u = await api(`/portfolio/${form.id}`, { method: 'PUT', body: form, token })
      setItems((xs) => xs.map((i) => (i.id === u.id ? u : i))); notify('Ish yangilandi')
    } else {
      const c = await api('/portfolio', { method: 'POST', body: form, token })
      setItems((xs) => [...xs, c]); notify("Ish qo'shildi")
    }
    setEditing(null)
  }

  const handleDelete = async (it) => {
    if (!window.confirm(`"${it.carName}" ishi o'chirilsinmi?`)) return
    try { await api(`/portfolio/${it.id}`, { method: 'DELETE', token }); setItems((xs) => xs.filter((i) => i.id !== it.id)); notify("Ish o'chirildi") }
    catch (e) { notify(e.message, 'err') }
  }

  const move = async (i, dir) => {
    const j = i + dir; if (j < 0 || j >= items.length) return
    const next = items.slice(); [next[i], next[j]] = [next[j], next[i]]; setItems(next)
    try { await api('/portfolio/reorder', { method: 'PUT', body: { ids: next.map((x) => x.id) }, token }) }
    catch (e) { notify(e.message, 'err'); load() }
  }

  return (
    <>
      <ManagerHeader title="Portfolio" count={items.length} unit="ish"
        addLabel="+ Yangi ish" onAdd={() => setEditing({ ...EMPTY })} />
      {loading
        ? <Center>Yuklanmoqda…</Center>
        : items.length === 0
          ? <Center>Hozircha ish yo'q. “+ Yangi ish” tugmasini bosing.</Center>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((it, i) => (
                <div key={it.id} className="card adm-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12 }}>
                  <Thumb url={it.imageUrl} />
                  <div className="adm-grow" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{it.carName}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.captionUz}</div>
                  </div>
                  <div className="adm-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <IconBtn title="Yuqoriga" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconBtn>
                    <IconBtn title="Pastga" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</IconBtn>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(it)}>Tahrirlash</button>
                    <DeleteBtn onClick={() => handleDelete(it)} />
                  </div>
                </div>
              ))}
            </div>
          )}
      {editing && (
        <PortfolioForm initial={editing} token={token} onCancel={() => setEditing(null)}
          onSave={handleSave} onError={(m) => notify(m, 'err')} />
      )}
    </>
  )
}

function PortfolioForm({ initial, token, onCancel, onSave, onError }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await onSave(form) } catch (err) { onError(err.message); setBusy(false) }
  }
  return (
    <Overlay onClose={onCancel}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="card"
        style={{ background: 'var(--surface)', padding: 28, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="display" style={{ fontSize: 22, margin: 0 }}>{form.id ? 'Ishni tahrirlash' : 'Yangi ish'}</h2>
          <button type="button" onClick={onCancel} aria-label="Yopish" style={{ background: 'transparent', border: 0, color: 'var(--fg-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <ImageUploader value={form.imageUrl} onChange={(url) => upd('imageUrl', url)} token={token} onError={onError} onBusy={setUploading} />
        <Field label="Avtomobil" required>
          <input value={form.carName} onChange={(e) => upd('carName', e.target.value)} required autoFocus placeholder="masalan: Chevrolet Cobalt" />
        </Field>
        <Field label="Izoh (o'zbekcha)" required>
          <input value={form.captionUz} onChange={(e) => upd('captionUz', e.target.value)} required placeholder="Premium chexol o'rnatildi" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Izoh (ruscha)"><input value={form.captionRu} onChange={(e) => upd('captionRu', e.target.value)} /></Field>
          <Field label="Izoh (inglizcha)"><input value={form.captionEn} onChange={(e) => upd('captionEn', e.target.value)} /></Field>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.4 }} disabled={busy || uploading}>{busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>
        </div>
      </form>
    </Overlay>
  )
}

function Thumb({ url }) {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
      {url
        ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span className="mono" style={{ fontSize: 9, color: 'var(--fg-dim)' }}>rasm</span>}
    </div>
  )
}
