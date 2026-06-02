import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createSeedData } from '../data/seed.js'

const DEFAULT_DATA_FILE = path.join(process.cwd(), 'server', 'data', 'local-db.json')

export class JsonStore {
  constructor(filePath = process.env.LOGALOAD_DATA_FILE || DEFAULT_DATA_FILE) {
    this.filePath = filePath
    this.queue = Promise.resolve()
  }

  async init() {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    try {
      await readFile(this.filePath, 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await this.write(createSeedData())
    }
  }

  async read() {
    await this.init()
    const raw = await readFile(this.filePath, 'utf8')
    const data = JSON.parse(raw)
    return mergeSeedShape(data)
  }

  async write(data) {
    const next = {
      ...data,
      meta: {
        ...(data.meta || {}),
        version: 1,
        updatedAt: new Date().toISOString(),
      },
    }
    const tempPath = `${this.filePath}.${Date.now()}.tmp`
    await writeFile(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    await rename(tempPath, this.filePath)
    return next
  }

  async update(mutator) {
    const job = this.queue.then(async () => {
      const data = await this.read()
      const result = await mutator(data)
      const written = await this.write(data)
      return result === undefined ? written : result
    })
    this.queue = job.catch(() => {})
    return job
  }
}

function mergeSeedShape(data) {
  const seed = createSeedData()
  return {
    ...seed,
    ...data,
    meta: { ...seed.meta, ...(data.meta || {}) },
    settings: { ...seed.settings, ...(data.settings || {}) },
    paymentLinks: { ...seed.paymentLinks, ...(data.paymentLinks || {}) },
    events: data.events || seed.events,
    ticketTypes: data.ticketTypes || seed.ticketTypes,
    funds: data.funds || seed.funds,
    orders: data.orders || [],
    donations: data.donations || [],
    registrations: data.registrations || [],
    vendorApplications: data.vendorApplications || [],
    contactRequests: data.contactRequests || [],
    adminNotes: data.adminNotes || [],
    webhooks: data.webhooks || [],
    emailOutbox: data.emailOutbox || [],
    auditLog: data.auditLog || [],
  }
}
