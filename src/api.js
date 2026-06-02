const defaultDevApiBase = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''
const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || defaultDevApiBase).replace(/\/$/, '')

export function hasApiBase() {
  return Boolean(configuredApiBase)
}

export function getAdminToken() {
  return window.localStorage.getItem('logaload.adminToken') || ''
}

export function setAdminToken(token) {
  if (!token) {
    window.localStorage.removeItem('logaload.adminToken')
    return
  }
  window.localStorage.setItem('logaload.adminToken', token)
}

export async function apiGet(path, token = '') {
  return apiRequest(path, { method: 'GET', token })
}

export async function apiPost(path, body, token = '') {
  return apiRequest(path, { method: 'POST', body, token })
}

export async function apiPut(path, body, token = '') {
  return apiRequest(path, { method: 'PUT', body, token })
}

export function apiExportUrl(type) {
  return `${configuredApiBase}/api/admin/export/${type}`
}

async function apiRequest(path, { method, body, token }) {
  if (!configuredApiBase) throw new Error('Backend API base URL is not configured.')
  const response = await fetch(`${configuredApiBase}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await readPayload(response)
  if (!response.ok) {
    throw new Error(payload?.error || `API request failed with ${response.status}`)
  }
  return payload
}

async function readPayload(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}
