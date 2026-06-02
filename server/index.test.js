import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { startServer } from './index.js'
import { JsonStore } from './lib/store.js'

test('backend v1 handles checkout, admin edit, export, and webhook reconciliation', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'logaload-api-'))
  const store = new JsonStore(path.join(dir, 'db.json'))
  const { server, port } = await startServer({ port: 0, store })
  const baseUrl = `http://127.0.0.1:${port}`

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await rm(dir, { recursive: true, force: true })
  })

  const health = await getJson(`${baseUrl}/api/health`)
  assert.equal(health.ok, true)
  assert.equal(health.service, 'log-a-load-backend-v1')

  const orderResponse = await postJson(`${baseUrl}/api/checkout/tickets`, {
    eventId: 'mud-fest',
    paymentMethod: 'paypal',
    buyer: { name: 'Miller Family', email: 'miller@example.com', phone: '555-1000' },
    items: [{ ticketId: 'general', quantity: 2 }],
  })
  assert.equal(orderResponse.status, 201)
  assert.equal(orderResponse.body.record.totalCents, 3000)
  assert.match(orderResponse.body.successPath, /record=order_/)

  const soldOutResponse = await postJson(`${baseUrl}/api/checkout/tickets`, {
    eventId: 'mud-fest',
    paymentMethod: 'paypal',
    buyer: { name: 'Big Buyer', email: 'big@example.com' },
    items: [{ ticketId: 'camping', quantity: 99 }],
  })
  assert.equal(soldOutResponse.status, 409)
  assert.match(soldOutResponse.body.error, /Camping pass only has/)

  const registrationResponse = await postJson(`${baseUrl}/api/registrations`, {
    name: 'Driver One',
    email: 'driver@example.com',
    phone: '555-2000',
    event: 'Truck Pull',
    signupType: 'Truck puller registration',
    group: 'Red Sled',
  })
  assert.equal(registrationResponse.status, 201)

  const loginResponse = await postJson(`${baseUrl}/api/admin/login`, { password: 'logaload-admin-preview' })
  assert.equal(loginResponse.status, 200)
  const token = loginResponse.body.token
  assert.ok(token)

  const updateResponse = await putJson(`${baseUrl}/api/admin/events/truck-pull`, token, {
    status: 'Registration open',
    location: 'Central Minnesota Fairgrounds',
  })
  assert.equal(updateResponse.status, 200)
  assert.equal(updateResponse.body.event.status, 'Registration open')

  const webhookResponse = await postJson(`${baseUrl}/api/webhooks/paypal`, {
    localRecordId: orderResponse.body.record.id,
    status: 'paid',
    providerPaymentId: 'PAYPAL-123',
  })
  assert.equal(webhookResponse.status, 202)
  assert.equal(webhookResponse.body.reconciled, true)

  const dashboard = await getJson(`${baseUrl}/api/admin/dashboard`, token)
  assert.equal(dashboard.counts.orders, 1)
  assert.equal(dashboard.counts.registrations, 1)
  assert.equal(dashboard.counts.outbox, 2)
  assert.equal(dashboard.money.paidTicketCents, 3000)

  const exportResponse = await fetch(`${baseUrl}/api/admin/export/orders`, {
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(exportResponse.status, 200)
  assert.match(await exportResponse.text(), /Miller Family/)
})

async function getJson(url, token) {
  const response = await fetch(url, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) assert.fail(await response.text())
  return response.json()
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}

async function putJson(url, token, body) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}
