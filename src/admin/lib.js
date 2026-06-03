// Shared admin helpers: token storage + API fetch wrapper.
const TOKEN_KEY = 'cbx_admin_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export function saveToken(t) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {}
}

// All calls hit /api (proxied to :3001 in dev, same-origin in prod).
export async function api(path, { method = 'GET', body, token, form } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (form) payload = body                                   // FormData — browser sets Content-Type
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  const res = await fetch(`/api${path}`, { method, headers, body: payload })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Xatolik (${res.status})`)
  return data
}
