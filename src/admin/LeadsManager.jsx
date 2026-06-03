// Leads manager — read-only list of submissions from the site forms, with delete.
import React, { useState, useEffect, useCallback } from 'react'
import { api } from './lib.js'
import { Center, Badge, DeleteBtn } from './ui.jsx'

const TYPE_LABEL = { quote: "So'rov", booking: 'Vaqt belgilash' }

function fmtDate(iso) {
  try {
    const d = new Date(iso)
    const p = (n) => String(n).padStart(2, '0')
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
  } catch { return '' }
}

export default function LeadsManager({ token, notify }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setLeads(await api('/leads', { token })) }
    catch (e) { notify(e.message, 'err') }
    finally { setLoading(false) }
  }, [notify, token])

  useEffect(() => { load() }, [load])

  const remove = async (l) => {
    if (!window.confirm(`"${l.name}" murojaati o'chirilsinmi?`)) return
    try {
      await api(`/leads/${l.id}`, { method: 'DELETE', token })
      setLeads((xs) => xs.filter((x) => x.id !== l.id))
      notify("Murojaat o'chirildi")
    } catch (e) { notify(e.message, 'err') }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 className="display" style={{ fontSize: 26, margin: 0 }}>Murojaatlar</h1>
          <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 12 }}>{leads.length} ta</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>↻ Yangilash</button>
      </div>

      {loading
        ? <Center>Yuklanmoqda…</Center>
        : leads.length === 0
          ? <Center>Hozircha murojaat yo'q. Saytdagi formalar to'ldirilganda shu yerда paydo bo'ladi.</Center>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leads.map((l) => (
                <div key={l.id} className="card adm-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 14 }}>
                  <div className="adm-grow" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 15 }}>{l.name}</span>
                      <a href={`tel:${l.phone}`} className="mono" style={{ color: 'var(--primary-bright)', fontSize: 13, textDecoration: 'none' }}>{l.phone}</a>
                      <Badge color={l.type === 'booking' ? 'color-mix(in oklab, var(--accent) 45%, var(--border))' : 'var(--border)'}>{TYPE_LABEL[l.type] || l.type}</Badge>
                    </div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                      {l.topic && <span>{l.topic}</span>}
                      {l.schedule && <span> · 📅 {l.schedule}</span>}
                      {l.notes && <div style={{ marginTop: 2, whiteSpace: 'pre-wrap' }}>{l.notes}</div>}
                    </div>
                  </div>
                  <div className="adm-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDate(l.createdAt)}</span>
                    <DeleteBtn onClick={() => remove(l)} />
                  </div>
                </div>
              ))}
            </div>
          )}
    </>
  )
}
