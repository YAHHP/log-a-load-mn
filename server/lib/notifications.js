export function addAdminNotification(data, { type, subject, recordId, payload }) {
  const now = new Date().toISOString()
  const message = {
    id: createId('email'),
    type,
    subject,
    recordId,
    to: data.settings?.adminEmails || [],
    status: 'queued',
    channel: 'local-outbox',
    payload,
    createdAt: now,
  }
  data.emailOutbox.unshift(message)
  return message
}

export function addAudit(data, { actor = 'public', action, recordId, detail = {} }) {
  data.auditLog.unshift({
    id: createId('audit'),
    actor,
    action,
    recordId,
    detail,
    createdAt: new Date().toISOString(),
  })
}

export function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
