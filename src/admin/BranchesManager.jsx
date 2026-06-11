// Branches manager — CRUD for company branches (address, phone, hours, socials, map coords).
import React, { useState, useEffect, useCallback } from 'react'
import { api } from './lib.js'
import { Field, Center, IconBtn, DeleteBtn, ManagerHeader, Overlay } from './ui.jsx'

const DAYS = [
  ['hoursMon', 'Dushanba'], ['hoursTue', 'Seshanba'], ['hoursWed', 'Chorshanba'],
  ['hoursThu', 'Payshanba'], ['hoursFri', 'Juma'], ['hoursSat', 'Shanba'], ['hoursSun', 'Yakshanba'],
]
const EMPTY = {
  name: '', addressUz: '', addressRu: '', addressEn: '', phone: '',
  hoursMon: '', hoursTue: '', hoursWed: '', hoursThu: '', hoursFri: '', hoursSat: '', hoursSun: '',
  lat: '', lng: '',
  telegram: '', instagram: '', facebook: '', youtube: '',
}

export default function BranchesManager({ token, notify }) {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const reordering = React.useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setBranches(await api('/branches')) }
    catch (e) { notify(e.message, 'err') }
    finally { setLoading(false) }
  }, [notify])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    if (form.id) {
      const u = await api(`/branches/${form.id}`, { method: 'PUT', body: form, token })
      setBranches((xs) => xs.map((x) => (x.id === u.id ? u : x))); notify('Filial yangilandi')
    } else {
      const c = await api('/branches', { method: 'POST', body: { ...form, displayOrder: branches.length }, token })
      setBranches((xs) => [...xs, c]); notify("Filial qo'shildi")
    }
    setEditing(null)
  }

  const handleDelete = async (x) => {
    if (!window.confirm(`"${x.name}" filiali o'chirilsinmi?`)) return
    try { await api(`/branches/${x.id}`, { method: 'DELETE', token }); setBranches((xs) => xs.filter((b) => b.id !== x.id)); notify("Filial o'chirildi") }
    catch (e) { notify(e.message, 'err') }
  }

  const move = async (i, dir) => {
    if (reordering.current) return
    const j = i + dir; if (j < 0 || j >= branches.length) return
    const next = branches.slice(); [next[i], next[j]] = [next[j], next[i]]; setBranches(next)
    reordering.current = true
    try { await api('/branches/reorder', { method: 'PUT', body: { ids: next.map((x) => x.id) }, token }) }
    catch (e) { notify(e.message, 'err'); load() }
    finally { reordering.current = false }
  }

  return (
    <>
      <ManagerHeader title="Filiallar" count={branches.length} unit="filial"
        addLabel="+ Yangi filial" onAdd={() => setEditing({ ...EMPTY })} />
      {loading
        ? <Center>Yuklanmoqda…</Center>
        : branches.length === 0
          ? <Center>Hozircha filial yo'q. “+ Yangi filial” tugmasini bosing.</Center>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {branches.map((x, i) => (
                <div key={x.id} className="card adm-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14 }}>
                  <div className="adm-grow" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{x.name}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.addressUz}</div>
                    <div className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11, marginTop: 2 }}>{x.phone}</div>
                  </div>
                  <div className="adm-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <IconBtn title="Yuqoriga" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconBtn>
                    <IconBtn title="Pastga" disabled={i === branches.length - 1} onClick={() => move(i, 1)}>↓</IconBtn>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(x)}>Tahrirlash</button>
                    <DeleteBtn onClick={() => handleDelete(x)} />
                  </div>
                </div>
              ))}
            </div>
          )}
      {editing && (
        <BranchForm initial={editing} onCancel={() => setEditing(null)}
          onSave={handleSave} onError={(m) => notify(m, 'err')} />
      )}
    </>
  )
}

function BranchForm({ initial, onCancel, onSave, onError }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [busy, setBusy] = useState(false)
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await onSave(form) } catch (err) { onError(err.message); setBusy(false) }
  }
  return (
    <Overlay onClose={onCancel}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="card"
        style={{ background: 'var(--surface)', padding: 28, width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="display" style={{ fontSize: 22, margin: 0 }}>{form.id ? 'Filialni tahrirlash' : 'Yangi filial'}</h2>
          <button type="button" onClick={onCancel} aria-label="Yopish" style={{ background: 'transparent', border: 0, color: 'var(--fg-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <Field label="Filial nomi" required>
          <input value={form.name} onChange={(e) => upd('name', e.target.value)} required autoFocus placeholder="masalan: Chilonzor filiali" />
        </Field>
        <Field label="Manzil (o'zbekcha)" required>
          <input value={form.addressUz} onChange={(e) => upd('addressUz', e.target.value)} required />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Manzil (ruscha)"><input value={form.addressRu} onChange={(e) => upd('addressRu', e.target.value)} /></Field>
          <Field label="Manzil (inglizcha)"><input value={form.addressEn} onChange={(e) => upd('addressEn', e.target.value)} /></Field>
        </div>
        <Field label="Telefon" required>
          <input value={form.phone} onChange={(e) => upd('phone', e.target.value)} required placeholder="+998 (77) 013-07-07" />
        </Field>
        <div className="eyebrow" style={{ fontSize: 10, marginTop: 4 }}>Ish vaqti (bo'sh qoldirsangiz — dam olish)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DAYS.map(([key, label]) => (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{label}</span>
              <input value={form[key]} onChange={(e) => upd(key, e.target.value)} placeholder="09:00 - 19:00" />
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Kenglik (lat)"><input value={form.lat} onChange={(e) => upd('lat', e.target.value)} placeholder="41.2995" /></Field>
            <Field label="Uzunlik (lng)"><input value={form.lng} onChange={(e) => upd('lng', e.target.value)} placeholder="69.2401" /></Field>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 6, lineHeight: 1.4 }}>
            Yandex Xaritada manzilni toping → sichqoncha o'ng tugmasi → koordinatalarni ko'chiring (lat, lng).
          </div>
        </div>

        <div className="eyebrow" style={{ fontSize: 10, marginTop: 4 }}>Ijtimoiy tarmoqlar (havola)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Telegram"><input value={form.telegram} onChange={(e) => upd('telegram', e.target.value)} placeholder="https://t.me/..." /></Field>
          <Field label="Instagram"><input value={form.instagram} onChange={(e) => upd('instagram', e.target.value)} placeholder="https://instagram.com/..." /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Facebook"><input value={form.facebook} onChange={(e) => upd('facebook', e.target.value)} placeholder="https://facebook.com/..." /></Field>
          <Field label="YouTube"><input value={form.youtube} onChange={(e) => upd('youtube', e.target.value)} placeholder="https://youtube.com/..." /></Field>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.4 }} disabled={busy}>{busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>
        </div>
      </form>
    </Overlay>
  )
}
