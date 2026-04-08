// In production (Vercel), set VITE_API_BASE_URL to your Render backend URL.
// In local dev it falls back to '/api' which Vite proxies to localhost:8000.
const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed  ${res.status}`)
  }
  return res.json()
}

export function analyzeProfile(payload) {
  return request('/analyze', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
}

export function fetchProperties(maxPrice) {
  const query = maxPrice != null ? `?max_price=${maxPrice}` : ''
  return request(`/properties${query}`)
}
