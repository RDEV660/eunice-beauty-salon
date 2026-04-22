import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dbPath = process.env.DATABASE_PATH ?? path.join(__dirname, '..', 'data', 'appointments.sqlite')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
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
