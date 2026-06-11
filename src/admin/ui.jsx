// Shared admin UI primitives.
import React from 'react'
import { api } from './lib.js'

// Image picker — uploads to /api/upload and reports the resulting URL.
// onBusy lets the parent disable its submit while an upload is in flight.
export function ImageUploader({ value, onChange, token, onError, onBusy }) {
  const fileRef = React.useRef(null)
  const [uploading, setUploading] = React.useState(false)
  const setU = (v) => { setUploading(v); onBusy?.(v) }
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setU(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await api('/upload', { method: 'POST', body: fd, form: true, token })
      onChange(url)
    } catch (err) { onError?.(err.message) }
    finally { setU(false) }
  }
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
        {value
          ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>rasm yo'q</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={onFile} hidden />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Yuklanmoqda…' : value ? 'Rasmni almashtirish' : 'Rasm yuklash'}
        </button>
        {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>Rasmni olib tashlash</button>}
      </div>
    </div>
  )
}

export function Field({ label, required, children }) {
  return (
    <div className="field">
      <label>{label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}</label>
      {children}
    </div>
  )
}

export function Center({ children }) {
  return <div style={{ color: 'var(--fg-muted)', padding: '60px 0', textAlign: 'center', fontSize: 14 }}>{children}</div>
}

export function Badge({ children, color }) {
  return (
    <span style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${color || 'var(--border)'}`, fontSize: 11, color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

export function IconBtn({ children, onClick, disabled, title }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled}
      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-muted)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, flexShrink: 0 }}>
      {children}
    </button>
  )
}

export function DeleteBtn({ onClick }) {
  return (
    <button className="btn btn-ghost btn-sm" onClick={onClick}
      style={{ color: '#e5484d', borderColor: 'color-mix(in oklab, #e5484d 45%, var(--border))' }}>
      O'chirish
    </button>
  )
}

export function ManagerHeader({ title, count, unit, addLabel, onAdd }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 className="display" style={{ fontSize: 26, margin: 0 }}>{title}</h1>
        <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 12 }}>{count} ta {unit}</span>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onAdd}>{addLabel}</button>
    </div>
  )
}

// Modal overlay — closes only when a click both STARTS and ENDS on the backdrop
// itself, so selecting text inside the form and releasing the mouse outside it
// won't discard the form. Also closes on Escape.
export function Overlay({ onClose, children }) {
  const downOnSelf = React.useRef(false)
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      onMouseDown={(e) => { downOnSelf.current = e.target === e.currentTarget }}
      onMouseUp={(e) => { if (downOnSelf.current && e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, padding: '40px 20px', overflowY: 'auto',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}>
      {children}
    </div>
  )
}

export function Toast({ msg, kind }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      padding: '12px 20px', borderRadius: 10, color: 'var(--fg)', fontSize: 14,
      background: kind === 'err' ? '#2a1414' : 'var(--elevated)',
      border: `1px solid ${kind === 'err' ? '#e5484d' : 'var(--primary)'}`,
      boxShadow: '0 12px 40px rgba(0,0,0,0.45)', maxWidth: '90vw',
    }}>
      {msg}
    </div>
  )
}
