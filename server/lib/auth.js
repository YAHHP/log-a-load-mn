import crypto from 'node:crypto'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'logaload-admin-preview'
}

export function getAuthMode() {
  return process.env.ADMIN_PASSWORD ? 'env-password' : 'dev-default-password'
}

export function verifyPassword(candidate) {
  const expected = getAdminPassword()
  const left = Buffer.from(String(candidate || ''))
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function createAdminToken(admin = { id: 'admin', role: 'owner' }) {
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = base64UrlEncode(JSON.stringify({ sub: admin.id, role: admin.role, exp: expiresAt }))
  const signature = sign(payload)
  return {
    token: `${payload}.${signature}`,
    expiresAt,
    admin,
  }
}

export function verifyAdminToken(token) {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature) return null
  if (!safeEqual(signature, sign(payload))) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!parsed.exp || parsed.exp < Date.now()) return null
    return { id: parsed.sub, role: parsed.role }
  } catch {
    return null
  }
}

export function requireAdmin(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  const admin = verifyAdminToken(token)
  if (!admin) {
    res.status(401).json({ error: 'Admin authentication required.' })
    return
  }
  req.admin = admin
  next()
}

function sign(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'local-logaload-session-secret-change-before-production'
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function safeEqual(left, right) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
