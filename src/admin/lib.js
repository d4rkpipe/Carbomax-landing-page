// Shared admin helpers: token storage + API fetch wrapper.
const TOKEN_KEY = 'cbx_admin_token'

// Registered by the Admin shell — invoked on any 401 so an expired/invalid token
// bounces the user back to the login screen instead of failing silently forever.
let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) { onUnauthorized = fn || (() => {}) }

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
  if (!res.ok) {
    if (res.status === 401) onUnauthorized()
    const err = new Error(data.error || `Xatolik (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}
