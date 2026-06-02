import express from 'express'
import { pathToFileURL } from 'node:url'
import crypto from 'node:crypto'
import { createAdminToken, getAuthMode, requireAdmin, verifyPassword } from './lib/auth.js'
import { toCsv } from './lib/csv.js'
import { addAdminNotification, addAudit, createId } from './lib/notifications.js'
import { JsonStore } from './lib/store.js'

const DEFAULT_PORT = Number(process.env.PORT || 8787)
const CHECKOUT_HOSTS = new Set([
  'www.paypal.com',
  'paypal.com',
  'www.sandbox.paypal.com',
  'buy.stripe.com',
  'checkout.stripe.com',
  'venmo.com',
  'account.venmo.com',
])

export function createApp({ store = new JsonStore() } = {}) {
  const app = express()

  app.use(corsMiddleware)
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', async (req, res) => {
    const data = await store.read()
    res.json({
      ok: true,
      service: 'log-a-load-backend-v1',
      authMode: getAuthMode(),
      dataFile: store.filePath,
      updatedAt: data.meta.updatedAt,
    })
  })

  app.get('/api/public/bootstrap', async (req, res) => {
    const data = await store.read()
    res.json(getPublicBootstrap(data))
  })

  app.post('/api/checkout/tickets', async (req, res) => {
    try {
      const response = await store.update((data) => createTicketOrder(data, req.body))
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/checkout/donations', async (req, res) => {
    try {
      const response = await store.update((data) => createDonation(data, req.body))
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/registrations', async (req, res) => {
    try {
      const response = await store.update((data) => createPublicRecord(data, 'registrations', req.body, {
        required: ['name', 'email', 'phone', 'event', 'signupType'],
        subject: 'New event registration',
        auditAction: 'registration.created',
      }))
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/vendor-applications', async (req, res) => {
    try {
      const response = await store.update((data) => createPublicRecord(data, 'vendorApplications', req.body, {
        required: ['business', 'name', 'email', 'booth', 'eventInterest'],
        subject: 'New vendor or sponsor request',
        auditAction: 'vendor_application.created',
      }))
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/contact-requests', async (req, res) => {
    try {
      const response = await store.update((data) => createPublicRecord(data, 'contactRequests', req.body, {
        required: ['name', 'email', 'questionType', 'message'],
        subject: 'New contact request',
        auditAction: 'contact_request.created',
      }))
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/webhooks/:provider', async (req, res) => {
    try {
      const response = await store.update((data) => recordPaymentWebhook(data, req.params.provider, req.body, req))
      res.status(202).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/admin/login', async (req, res) => {
    if (!verifyPassword(req.body?.password)) {
      res.status(401).json({ error: 'Invalid admin password.' })
      return
    }
    res.json(createAdminToken({ id: 'log-a-load-admin', role: 'owner' }))
  })

  app.use('/api/admin', requireAdmin)

  app.get('/api/admin/dashboard', async (req, res) => {
    const data = await store.read()
    res.json(getAdminDashboard(data))
  })

  app.post('/api/admin/events', async (req, res) => {
    try {
      const response = await store.update((data) => {
        const event = sanitizeEvent(req.body, { create: true })
        if (data.events.some((item) => item.id === event.id)) throw inputError(`Event id already exists: ${event.id}`, 409)
        data.events.push(event)
        addAudit(data, { actor: req.admin.id, action: 'event.created', recordId: event.id, detail: { label: event.label } })
        return { event }
      })
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.put('/api/admin/events/:id', async (req, res) => {
    try {
      const response = await store.update((data) => {
        const event = data.events.find((item) => item.id === req.params.id)
        if (!event) throw inputError('Event not found.', 404)
        Object.assign(event, sanitizeEventPatch(req.body))
        addAudit(data, { actor: req.admin.id, action: 'event.updated', recordId: event.id, detail: req.body })
        return { event }
      })
      res.json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.put('/api/admin/tickets/:id', async (req, res) => {
    try {
      const response = await store.update((data) => {
        const ticket = data.ticketTypes.find((item) => item.id === req.params.id)
        if (!ticket) throw inputError('Ticket type not found.', 404)
        Object.assign(ticket, sanitizeTicketPatch(req.body))
        addAudit(data, { actor: req.admin.id, action: 'ticket.updated', recordId: ticket.id, detail: req.body })
        return { ticket }
      })
      res.json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/admin/funds', async (req, res) => {
    try {
      const response = await store.update((data) => {
        const fund = sanitizeFund(req.body, { create: true })
        if (data.funds.some((item) => item.id === fund.id)) throw inputError(`Fund id already exists: ${fund.id}`, 409)
        data.funds.push(fund)
        addAudit(data, { actor: req.admin.id, action: 'fund.created', recordId: fund.id, detail: { label: fund.label } })
        return { fund }
      })
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.put('/api/admin/funds/:id', async (req, res) => {
    try {
      const response = await store.update((data) => {
        const fund = data.funds.find((item) => item.id === req.params.id)
        if (!fund) throw inputError('Fund not found.', 404)
        Object.assign(fund, sanitizeFundPatch(req.body))
        addAudit(data, { actor: req.admin.id, action: 'fund.updated', recordId: fund.id, detail: req.body })
        return { fund }
      })
      res.json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.put('/api/admin/payment-links', async (req, res) => {
    try {
      const response = await store.update((data) => {
        data.paymentLinks = sanitizePaymentLinks({ ...data.paymentLinks, ...req.body })
        addAudit(data, { actor: req.admin.id, action: 'payment_links.updated', recordId: 'payment-links' })
        return { paymentLinks: data.paymentLinks }
      })
      res.json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.post('/api/admin/notes', async (req, res) => {
    try {
      const response = await store.update((data) => {
        const note = {
          id: createId('note'),
          text: cleanString(req.body?.text || req.body?.name, 500),
          priority: cleanString(req.body?.priority || 'Event copy', 80),
          status: 'open',
          createdAt: new Date().toISOString(),
        }
        if (!note.text) throw inputError('Admin note text is required.')
        data.adminNotes.unshift(note)
        addAudit(data, { actor: req.admin.id, action: 'admin_note.created', recordId: note.id, detail: { priority: note.priority } })
        return { note }
      })
      res.status(201).json(response)
    } catch (error) {
      sendInputError(res, error)
    }
  })

  app.get('/api/admin/export/:type', async (req, res) => {
    try {
      const data = await store.read()
      const rows = getExportRows(data, req.params.type)
      res.setHeader('content-type', 'text/csv; charset=utf-8')
      res.setHeader('content-disposition', `attachment; filename="log-a-load-${req.params.type}.csv"`)
      res.send(toCsv(rows))
    } catch (error) {
      sendInputError(res, error)
    }
  })

  return app
}

export async function startServer({ port = DEFAULT_PORT, store = new JsonStore() } = {}) {
  await store.init()
  const app = createApp({ store })
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve({ app, server, port: server.address().port, store })
    })
  })
}

function getPublicBootstrap(data) {
  return {
    events: data.events,
    funds: data.funds.filter((fund) => fund.status !== 'archived'),
    ticketTypes: getTicketAvailability(data),
    paymentStatus: Object.fromEntries(Object.entries(data.paymentLinks).map(([key, value]) => [key, Boolean(value)])),
    settings: {
      siteName: data.settings.siteName,
      publicBaseUrl: data.settings.publicBaseUrl,
    },
  }
}

function getAdminDashboard(data) {
  const orders = data.orders || []
  const donations = data.donations || []
  const paidTicketCents = orders.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.totalCents, 0)
  const paidDonationCents = donations.filter((donation) => donation.status === 'paid').reduce((sum, donation) => sum + donation.amountCents, 0)
  return {
    events: data.events,
    funds: data.funds,
    ticketTypes: getTicketAvailability(data),
    paymentLinks: data.paymentLinks,
    counts: {
      orders: orders.length,
      paidOrders: orders.filter((order) => order.status === 'paid').length,
      donations: donations.length,
      registrations: data.registrations.length,
      vendors: data.vendorApplications.length,
      contacts: data.contactRequests.length,
      outbox: data.emailOutbox.length,
    },
    money: {
      paidTicketCents,
      paidDonationCents,
      projectedCents: paidTicketCents + paidDonationCents,
    },
    recent: {
      orders: orders.slice(0, 8),
      donations: donations.slice(0, 8),
      registrations: data.registrations.slice(0, 8),
      vendorApplications: data.vendorApplications.slice(0, 8),
      contactRequests: data.contactRequests.slice(0, 8),
      adminNotes: data.adminNotes.slice(0, 8),
      emailOutbox: data.emailOutbox.slice(0, 8),
      auditLog: data.auditLog.slice(0, 12),
    },
  }
}

function createTicketOrder(data, body) {
  const buyer = sanitizePerson(body?.buyer || body)
  requireFields(buyer, ['name', 'email'])
  const eventId = cleanString(body?.eventId || 'mud-fest', 80)
  const paymentMethod = cleanString(body?.paymentMethod || 'paypal', 40)
  const rawItems = Array.isArray(body?.items) ? body.items : []
  if (!rawItems.length) throw inputError('At least one ticket item is required.')

  const availability = getTicketAvailability(data)
  const items = rawItems
    .map((item) => {
      const ticket = availability.find((available) => available.id === item.ticketId)
      const quantity = Math.max(0, Number.parseInt(item.quantity, 10) || 0)
      if (!ticket || quantity <= 0) return null
      if (ticket.eventId !== eventId) throw inputError(`${ticket.label} is not available for this event.`, 409)
      if (quantity > ticket.remaining) throw inputError(`${ticket.label} only has ${ticket.remaining} remaining.`, 409)
      return {
        ticketId: ticket.id,
        label: ticket.label,
        quantity,
        priceCents: ticket.priceCents,
        subtotalCents: ticket.priceCents * quantity,
      }
    })
    .filter(Boolean)

  if (!items.length) throw inputError('At least one valid ticket quantity is required.')

  const order = {
    id: createId('order'),
    eventId,
    buyer,
    items,
    totalCents: items.reduce((sum, item) => sum + item.subtotalCents, 0),
    paymentMethod,
    status: 'pending_payment',
    providerPaymentId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.orders.unshift(order)
  addAdminNotification(data, {
    type: 'ticket-order',
    subject: `Ticket checkout started: ${buyer.name}`,
    recordId: order.id,
    payload: order,
  })
  addAudit(data, { actor: 'public', action: 'ticket_order.created', recordId: order.id, detail: { eventId, totalCents: order.totalCents } })

  return {
    record: order,
    checkoutUrl: getCheckoutUrl(data.paymentLinks, paymentMethod, 'tickets'),
    successPath: `/success?flow=tickets&method=${encodeURIComponent(paymentMethod)}&preview=true&total=${encodeURIComponent(formatMoney(order.totalCents))}&record=${order.id}`,
  }
}

function createDonation(data, body) {
  const donor = sanitizePerson(body?.donor || body)
  requireFields(donor, ['name', 'email'])
  const amountCents = parseMoneyToCents(body?.amountCents ?? body?.amount)
  if (amountCents <= 0) throw inputError('Donation amount must be greater than zero.')
  const fundId = cleanString(body?.fundId || 'general', 80)
  const fund = data.funds.find((item) => item.id === fundId)
  if (!fund) throw inputError('Selected fund was not found.', 404)
  const paymentMethod = cleanString(body?.paymentMethod || 'paypal', 40)
  const donation = {
    id: createId('donation'),
    fundId,
    fundLabel: fund.label,
    donor,
    amountCents,
    note: cleanString(body?.note, 500),
    paymentMethod,
    status: 'pending_payment',
    providerPaymentId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.donations.unshift(donation)
  addAdminNotification(data, {
    type: 'donation',
    subject: `Donation checkout started: ${donor.name}`,
    recordId: donation.id,
    payload: donation,
  })
  addAudit(data, { actor: 'public', action: 'donation.created', recordId: donation.id, detail: { fundId, amountCents } })

  return {
    record: donation,
    checkoutUrl: getCheckoutUrl(data.paymentLinks, paymentMethod, 'donation'),
    successPath: `/success?flow=donation&method=${encodeURIComponent(paymentMethod)}&preview=true&total=${encodeURIComponent(formatMoney(amountCents))}&fund=${encodeURIComponent(fund.label)}&record=${donation.id}`,
  }
}

function createPublicRecord(data, collection, body, config) {
  const payload = sanitizePayload(body)
  requireFields(payload, config.required)
  const record = {
    id: createId(collection),
    status: 'new',
    ...payload,
    createdAt: new Date().toISOString(),
  }
  data[collection].unshift(record)
  addAdminNotification(data, {
    type: collection,
    subject: config.subject,
    recordId: record.id,
    payload: record,
  })
  addAudit(data, { actor: 'public', action: config.auditAction, recordId: record.id })
  return { record }
}

function recordPaymentWebhook(data, provider, body, req) {
  verifyWebhookSignature(req, body)
  const localRecordId = cleanString(body?.localRecordId || body?.recordId || body?.metadata?.recordId, 120)
  const status = cleanString(body?.status || body?.eventType || 'received', 80)
  const providerPaymentId = cleanString(body?.providerPaymentId || body?.paymentId || body?.id, 160)
  const webhook = {
    id: createId('webhook'),
    provider: cleanString(provider, 40),
    localRecordId,
    status,
    providerPaymentId,
    payload: body,
    createdAt: new Date().toISOString(),
  }
  data.webhooks.unshift(webhook)

  let reconciled = false
  if (localRecordId && ['paid', 'completed', 'checkout.session.completed', 'PAYMENT.CAPTURE.COMPLETED'].includes(status)) {
    const record = [...data.orders, ...data.donations].find((item) => item.id === localRecordId)
    if (record) {
      record.status = 'paid'
      record.providerPaymentId = providerPaymentId
      record.updatedAt = new Date().toISOString()
      reconciled = true
      addAudit(data, { actor: provider, action: 'payment.reconciled', recordId: record.id, detail: { providerPaymentId } })
    }
  }

  return { webhook, reconciled }
}

function getTicketAvailability(data) {
  return data.ticketTypes.map((ticket) => {
    const reserved = data.orders
      .filter((order) => order.status === 'pending_payment' || order.status === 'paid')
      .flatMap((order) => order.items || [])
      .filter((item) => item.ticketId === ticket.id)
      .reduce((sum, item) => sum + item.quantity, 0)
    const sold = ticket.sold + reserved
    const remaining = Math.max(0, ticket.capacity - sold)
    const percentSold = ticket.capacity > 0 ? Math.round((sold / ticket.capacity) * 100) : 0
    return {
      ...ticket,
      price: formatMoney(ticket.priceCents),
      sold,
      remaining,
      percentSold,
    }
  })
}

function getCheckoutUrl(paymentLinks, method, flow) {
  if (method === 'paypal') return flow === 'donation' ? paymentLinks.paypalDonate : paymentLinks.paypalTickets
  if (method === 'stripe') return flow === 'donation' ? paymentLinks.stripeDonate : paymentLinks.stripeTickets
  if (method === 'venmo') return paymentLinks.venmo
  return ''
}

function sanitizePerson(input) {
  return {
    name: cleanString(input?.name, 120),
    email: cleanString(input?.email, 180).toLowerCase(),
    phone: cleanString(input?.phone, 60),
  }
}

function sanitizePayload(input) {
  const payload = {}
  for (const [key, value] of Object.entries(input || {})) {
    payload[key] = typeof value === 'string' ? cleanString(value, 1000) : value
  }
  return payload
}

function sanitizeEvent(input, { create = false } = {}) {
  const label = cleanString(input?.label, 140)
  if (!label) throw inputError('Event label is required.')
  return {
    id: create ? slugify(input?.id || label) : cleanString(input?.id, 80),
    label,
    pagePath: cleanString(input?.pagePath || `/events/${slugify(label)}`, 120),
    date: cleanString(input?.date, 120),
    location: cleanString(input?.location, 160),
    status: cleanString(input?.status || 'Draft', 80),
    goalCents: parseMoneyToCents(input?.goalCents ?? input?.goal ?? 0),
    raisedCents: parseMoneyToCents(input?.raisedCents ?? input?.raised ?? 0),
    hostUrl: sanitizeHostedUrl(input?.hostUrl, { allowEmpty: true }),
    hostLabel: cleanString(input?.hostLabel, 140),
    summary: cleanString(input?.summary, 1000),
    eventDayNote: cleanString(input?.eventDayNote, 1000),
    reportNote: cleanString(input?.reportNote, 1000),
  }
}

function sanitizeEventPatch(input) {
  const allowed = ['label', 'pagePath', 'date', 'location', 'status', 'goalCents', 'goal', 'raisedCents', 'raised', 'hostUrl', 'hostLabel', 'summary', 'eventDayNote', 'reportNote']
  const patch = {}
  for (const key of allowed) {
    if (!(key in (input || {}))) continue
    if (key === 'goal' || key === 'goalCents') patch.goalCents = parseMoneyToCents(input[key])
    else if (key === 'raised' || key === 'raisedCents') patch.raisedCents = parseMoneyToCents(input[key])
    else if (key === 'hostUrl') patch.hostUrl = sanitizeHostedUrl(input[key], { allowEmpty: true })
    else patch[key] = cleanString(input[key], 1000)
  }
  return patch
}

function sanitizeTicketPatch(input) {
  const patch = {}
  if ('label' in input) patch.label = cleanString(input.label, 140)
  if ('eventId' in input) patch.eventId = cleanString(input.eventId, 80)
  if ('priceCents' in input || 'price' in input) patch.priceCents = parseMoneyToCents(input.priceCents ?? input.price)
  if ('capacity' in input) patch.capacity = Math.max(0, Number.parseInt(input.capacity, 10) || 0)
  if ('sold' in input) patch.sold = Math.max(0, Number.parseInt(input.sold, 10) || 0)
  if ('status' in input) patch.status = cleanString(input.status, 80)
  if ('note' in input) patch.note = cleanString(input.note, 500)
  return patch
}

function sanitizeFund(input, { create = false } = {}) {
  const label = cleanString(input?.label, 140)
  if (!label) throw inputError('Fund label is required.')
  return {
    id: create ? slugify(input?.id || label) : cleanString(input?.id, 80),
    label,
    note: cleanString(input?.note, 800),
    status: cleanString(input?.status || 'published', 80),
  }
}

function sanitizeFundPatch(input) {
  const patch = {}
  if ('label' in input) patch.label = cleanString(input.label, 140)
  if ('note' in input) patch.note = cleanString(input.note, 800)
  if ('status' in input) patch.status = cleanString(input.status, 80)
  return patch
}

function sanitizePaymentLinks(input) {
  return {
    paypalTickets: sanitizeHostedUrl(input.paypalTickets, { allowEmpty: true }),
    paypalDonate: sanitizeHostedUrl(input.paypalDonate, { allowEmpty: true }),
    venmo: sanitizeHostedUrl(input.venmo, { allowEmpty: true }),
    stripeTickets: sanitizeHostedUrl(input.stripeTickets, { allowEmpty: true }),
    stripeDonate: sanitizeHostedUrl(input.stripeDonate, { allowEmpty: true }),
  }
}

function sanitizeHostedUrl(rawUrl, { allowEmpty = false } = {}) {
  const value = cleanString(rawUrl, 600)
  if (!value && allowEmpty) return ''
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !CHECKOUT_HOSTS.has(url.hostname)) {
      throw inputError(`Unsupported hosted payment URL: ${url.hostname}`)
    }
    return url.href
  } catch (error) {
    if (error.statusCode) throw error
    throw inputError('Hosted payment URL must be a valid https PayPal, Stripe, or Venmo URL.')
  }
}

function getExportRows(data, type) {
  const exports = {
    orders: data.orders,
    donations: data.donations,
    registrations: data.registrations,
    vendors: data.vendorApplications,
    contacts: data.contactRequests,
    tickets: getTicketAvailability(data),
    funds: data.funds,
    outbox: data.emailOutbox,
    audit: data.auditLog,
  }
  if (!exports[type]) throw inputError('Unknown export type.', 404)
  return exports[type].map(flattenRow)
}

function flattenRow(row) {
  const flat = {}
  for (const [key, value] of Object.entries(row)) {
    flat[key] = typeof value === 'object' && value !== null ? JSON.stringify(value) : value
  }
  return flat
}

function requireFields(payload, fields) {
  const missing = fields.filter((field) => !payload[field])
  if (missing.length) throw inputError(`Missing required fields: ${missing.join(', ')}`)
}

function parseMoneyToCents(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0
  const cleaned = String(value || '').replace(/[^0-9.]/g, '')
  if (!cleaned) return 0
  return Math.round(Number.parseFloat(cleaned) * 100)
}

function formatMoney(cents) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function cleanString(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength)
}

function slugify(value) {
  return cleanString(value, 100)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function verifyWebhookSignature(req, body) {
  const secret = process.env.WEBHOOK_SHARED_SECRET
  if (!secret) return
  const signature = req.get('x-logaload-signature') || ''
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
  if (signature !== expected) throw inputError('Invalid webhook signature.', 401)
}

function inputError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function sendInputError(res, error) {
  const statusCode = error.statusCode || 500
  res.status(statusCode).json({ error: statusCode === 500 ? 'Server error.' : error.message })
}

function corsMiddleware(req, res, next) {
  const origin = req.get('origin')
  const allowed = (process.env.CORS_ORIGINS || 'http://127.0.0.1:5177,http://localhost:5177,http://127.0.0.1:5178,http://localhost:5178')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (origin && (allowed.includes('*') || allowed.includes(origin))) {
    res.setHeader('access-control-allow-origin', origin)
    res.setHeader('vary', 'Origin')
  }
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type,authorization,x-logaload-signature')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().then(({ port, store }) => {
    console.log(`Log A Load Backend V1 listening on http://127.0.0.1:${port}`)
    console.log(`Data file: ${store.filePath}`)
  })
}
