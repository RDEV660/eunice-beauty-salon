import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function defaultDbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH
  // Vercel serverless: only /tmp is writable; DB is best-effort (use external DB for production scale).
  if (process.env.VERCEL) return '/tmp/appointments.sqlite'
  return path.join(__dirname, '..', 'data', 'appointments.sqlite')
}

const dbPath = defaultDbPath()

// Lazy-load better-sqlite3 so cold starts (e.g. /api/health) do not pay native module + disk cost.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null

export function getDb() {
  if (!db) {
    const Database = require('better-sqlite3')
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    const instance = new Database(dbPath)
    instance.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        slot_start TEXT NOT NULL,
        square_payment_id TEXT,
        square_order_id TEXT,
        square_customer_id TEXT,
        note TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_appointments_slot ON appointments(slot_start);
    `)
    try {
      instance.exec(`ALTER TABLE appointments ADD COLUMN square_customer_id TEXT`)
    } catch {
      /* column exists */
    }
    db = instance
  }
  return db
}

export type NewAppointment = {
  name: string
  email: string
  phone: string
  service: string
  slotStart: string
  squarePaymentId: string
  squareCustomerId?: string
  note?: string
}

export function insertAppointment(row: NewAppointment): number {
  const stmt = getDb().prepare(`
    INSERT INTO appointments (created_at, name, email, phone, service, slot_start, square_payment_id, square_customer_id, note)
    VALUES (@created_at, @name, @email, @phone, @service, @slot_start, @square_payment_id, @square_customer_id, @note)
  `)
  const info = stmt.run({
    created_at: new Date().toISOString(),
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    slot_start: row.slotStart,
    square_payment_id: row.squarePaymentId,
    square_customer_id: row.squareCustomerId ?? '',
    note: row.note ?? '',
  })
  return Number(info.lastInsertRowid)
}

export function listBookedSlotStarts(fromIso: string, toIso: string): string[] {
  const rows = getDb()
    .prepare(
      `SELECT slot_start FROM appointments WHERE slot_start >= @from AND slot_start < @to`,
    )
    .all({ from: fromIso, to: toIso }) as { slot_start: string }[]
  return rows.map((r) => r.slot_start)
}
