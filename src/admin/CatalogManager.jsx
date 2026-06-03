// Catalog manager — products + categories, switched via sub-tabs.
import React, { useState, useEffect, useCallback } from 'react'
import { api } from './lib.js'
import { Field, Center, Badge, IconBtn, DeleteBtn, Overlay, ImageUploader } from './ui.jsx'

const fmtUZS = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const EMPTY_PRODUCT = { sku: '', category: '', carName: '', price: '', nameUz: '', nameRu: '', nameEn: '', imageUrl: '' }
const EMPTY_CAT = { nameUz: '', nameRu: '', nameEn: '' }

export default function CatalogManager({ token, notify }) {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)       // product
  const [editingCat, setEditingCat] = useState(null) // category

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([api('/products'), api('/categories')])
      setProducts(p); setCategories(c)
    } catch (e) { notify(e.message, 'err') }
    finally { setLoading(false) }
  }, [notify])

  useEffect(() => { load() }, [load])

  const catName = (slug) => (categories.find((c) => c.slug === slug) || {}).nameUz || slug

  // ── product handlers ──
  const saveProduct = async (form) => {
    const payload = { ...form, price: Number(form.price) || 0 }
    if (form.id) {
      const u = await api(`/products/${form.id}`, { method: 'PUT', body: payload, token })
      setProducts((ps) => ps.map((p) => (p.id === u.id ? u : p))); notify('Mahsulot yangilandi')
    } else {
      const c = await api('/products', { method: 'POST', body: payload, token })
      setProducts((ps) => [...ps, c]); notify("Mahsulot qo'shildi")
    }
    setEditing(null)
  }
  const deleteProduct = async (p) => {
    if (!window.confirm(`"${p.nameUz}" mahsuloti o'chirilsinmi?`)) return
    try { await api(`/products/${p.id}`, { method: 'DELETE', token }); setProducts((ps) => ps.filter((x) => x.id !== p.id)); notify("Mahsulot o'chirildi") }
    catch (e) { notify(e.message, 'err') }
  }
  const moveProduct = async (i, dir) => {
    const j = i + dir; if (j < 0 || j >= products.length) return
    const next = products.slice(); [next[i], next[j]] = [next[j], next[i]]; setProducts(next)
    try { await api('/products/reorder', { method: 'PUT', body: { ids: next.map((p) => p.id) }, token }) }
    catch (e) { notify(e.message, 'err'); load() }
  }

  // ── category handlers ──
  const saveCat = async (form) => {
    if (form.id) {
      const u = await api(`/categories/${form.id}`, { method: 'PUT', body: form, token })
      setCategories((cs) => cs.map((c) => (c.id === u.id ? u : c))); notify('Kategoriya yangilandi')
    } else {
      const c = await api('/categories', { method: 'POST', body: form, token })
      setCategories((cs) => [...cs, c]); notify("Kategoriya qo'shildi")
    }
    setEditingCat(null)
  }
  const deleteCat = async (c) => {
    if (!window.confirm(`"${c.nameUz}" kategoriyasi o'chirilsinmi?`)) return
    try { await api(`/categories/${c.id}`, { method: 'DELETE', token }); setCategories((cs) => cs.filter((x) => x.id !== c.id)); notify("Kategoriya o'chirildi") }
    catch (e) { notify(e.message, 'err') }
  }
  const moveCat = async (i, dir) => {
    const j = i + dir; if (j < 0 || j >= categories.length) return
    const next = categories.slice(); [next[i], next[j]] = [next[j], next[i]]; setCategories(next)
    try { await api('/categories/reorder', { method: 'PUT', body: { ids: next.map((c) => c.id) }, token }) }
    catch (e) { notify(e.message, 'err'); load() }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabPill active={tab === 'products'} onClick={() => setTab('products')}>Mahsulotlar ({products.length})</TabPill>
          <TabPill active={tab === 'categories'} onClick={() => setTab('categories')}>Kategoriyalar ({categories.length})</TabPill>
        </div>
        {tab === 'products'
          ? <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY_PRODUCT, category: categories[0]?.slug || '' })}>+ Yangi mahsulot</button>
          : <button className="btn btn-primary btn-sm" onClick={() => setEditingCat({ ...EMPTY_CAT })}>+ Yangi kategoriya</button>}
      </div>

      {loading ? <Center>Yuklanmoqda…</Center> : tab === 'products' ? (
        products.length === 0
          ? <Center>Hozircha mahsulot yo'q. “+ Yangi mahsulot” tugmasini bosing.</Center>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {products.map((p, i) => (
                <div key={p.id} className="card adm-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12 }}>
                  <Thumb url={p.imageUrl} />
                  <div className="adm-grow" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nameUz}</div>
                    <div className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11, marginTop: 2 }}>{p.sku} · {p.carName}</div>
                  </div>
                  <Badge>{catName(p.category)}</Badge>
                  <div className="tnum" style={{ width: 130, textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 15 }}>
                    {fmtUZS(p.price)} <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>so'm</span>
                  </div>
                  <div className="adm-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <IconBtn title="Yuqoriga" disabled={i === 0} onClick={() => moveProduct(i, -1)}>↑</IconBtn>
                    <IconBtn title="Pastga" disabled={i === products.length - 1} onClick={() => moveProduct(i, 1)}>↓</IconBtn>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Tahrirlash</button>
                    <DeleteBtn onClick={() => deleteProduct(p)} />
                  </div>
                </div>
              ))}
            </div>
          )
      ) : (
        categories.length === 0
          ? <Center>Hozircha kategoriya yo'q. “+ Yangi kategoriya” tugmasini bosing.</Center>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categories.map((c, i) => {
                const used = products.filter((p) => p.category === c.slug).length
                return (
                  <div key={c.id} className="card adm-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px' }}>
                    <div className="adm-grow" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 15 }}>{c.nameUz}</div>
                      <div className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11, marginTop: 2 }}>{c.slug} · {c.nameRu} · {c.nameEn}</div>
                    </div>
                    <Badge>{used} ta mahsulot</Badge>
                    <div className="adm-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <IconBtn title="Yuqoriga" disabled={i === 0} onClick={() => moveCat(i, -1)}>↑</IconBtn>
                      <IconBtn title="Pastga" disabled={i === categories.length - 1} onClick={() => moveCat(i, 1)}>↓</IconBtn>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingCat(c)}>Tahrirlash</button>
                      <DeleteBtn onClick={() => deleteCat(c)} />
                    </div>
                  </div>
                )
              })}
            </div>
          )
      )}

      {editing && (
        <ProductForm initial={editing} categories={categories} token={token}
          onCancel={() => setEditing(null)} onSave={saveProduct} onError={(m) => notify(m, 'err')} />
      )}
      {editingCat && (
        <CategoryForm initial={editingCat} onCancel={() => setEditingCat(null)}
          onSave={saveCat} onError={(m) => notify(m, 'err')} />
      )}
    </>
  )
}

function TabPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
      background: active ? 'var(--fg)' : 'transparent', color: active ? 'var(--bg)' : 'var(--fg-muted)',
      border: `1px solid ${active ? 'var(--fg)' : 'var(--border)'}`, transition: 'all .15s ease',
    }}>{children}</button>
  )
}

function ProductForm({ initial, categories, token, onCancel, onSave, onError }) {
  const [form, setForm] = useState({ ...EMPTY_PRODUCT, ...initial, price: initial.price ?? '' })
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
        style={{ background: 'var(--surface)', padding: 28, width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="display" style={{ fontSize: 22, margin: 0 }}>{form.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h2>
          <button type="button" onClick={onCancel} aria-label="Yopish" style={{ background: 'transparent', border: 0, color: 'var(--fg-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <ImageUploader value={form.imageUrl} onChange={(url) => upd('imageUrl', url)} token={token} onError={onError} onBusy={setUploading} />
        <Field label="Nomi (o'zbekcha)" required>
          <input value={form.nameUz} onChange={(e) => upd('nameUz', e.target.value)} required autoFocus />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nomi (ruscha)"><input value={form.nameRu} onChange={(e) => upd('nameRu', e.target.value)} /></Field>
          <Field label="Nomi (inglizcha)"><input value={form.nameEn} onChange={(e) => upd('nameEn', e.target.value)} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Kategoriya" required>
            <select value={form.category} onChange={(e) => upd('category', e.target.value)} required>
              <option value="" disabled>—</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.nameUz}</option>)}
            </select>
          </Field>
          <Field label="Avtomobil modeli" required>
            <input value={form.carName} onChange={(e) => upd('carName', e.target.value)} placeholder="Chevrolet Cobalt / Universal" required />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Narxi (so'm)" required>
            <input type="number" min="0" step="1000" value={form.price} onChange={(e) => upd('price', e.target.value)} required />
          </Field>
          <Field label="SKU (artikul)" required>
            <input value={form.sku} onChange={(e) => upd('sku', e.target.value)} placeholder="CBX-..." required />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.4 }} disabled={busy || uploading}>{busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>
        </div>
      </form>
    </Overlay>
  )
}

function CategoryForm({ initial, onCancel, onSave, onError }) {
  const [form, setForm] = useState({ ...EMPTY_CAT, ...initial })
  const [busy, setBusy] = useState(false)
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
          <h2 className="display" style={{ fontSize: 22, margin: 0 }}>{form.id ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h2>
          <button type="button" onClick={onCancel} aria-label="Yopish" style={{ background: 'transparent', border: 0, color: 'var(--fg-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <Field label="Nomi (o'zbekcha)" required>
          <input value={form.nameUz} onChange={(e) => upd('nameUz', e.target.value)} required autoFocus placeholder="masalan: Bagaj qoplamalari" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nomi (ruscha)"><input value={form.nameRu} onChange={(e) => upd('nameRu', e.target.value)} /></Field>
          <Field label="Nomi (inglizcha)"><input value={form.nameEn} onChange={(e) => upd('nameEn', e.target.value)} /></Field>
        </div>
        {form.slug
          ? <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>slug: {form.slug} (o'zgarmaydi)</div>
          : <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>slug nomdan avtomatik yaratiladi</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.4 }} disabled={busy}>{busy ? 'Saqlanmoqda…' : 'Saqlash'}</button>
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
