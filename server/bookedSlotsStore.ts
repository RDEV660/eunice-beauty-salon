import { hasAppointmentAtSlotStart } from './db.js'
import { isFlexSlotPlaceholder } from './slotAvailability.js'

/**
 * Vercel serverless: SQLite in /tmp is not shared between invocations, so paid bookings
 * were invisible to /api/slots on other warm instances. When BLOB_READ_WRITE_TOKEN is
 * set, we mirror taken slot_start ISOs here so the calendar matches reality everywhere.
 * Same file pattern as `blockedStore.ts`.
 */
const BLOB_PATH = 'eunice/booked-slot-starts.json'

type FileShape = { slotStarts: string[] }

function hasBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

function mergeUniqueIsos(isos: string[]): string[] {
  return [...new Set(isos.map((s) => s.trim()).filter(Boolean))].sort()
}

export async function readAllBookedSlotStartsFromBlob(): Promise<string[]> {
  if (!hasBlobStore()) return []
  try {
    const { get } = await import('@vercel/blob')
    const result = await get(BLOB_PATH, { access: 'private', useCache: false })
    if (result == null) return []
    if (result.statusCode !== 200 || !result.stream) return []
    const json = await new Response(result.stream as unknown as BodyInit).text()
    let data: FileShape
    try {
      data = JSON.parse(json) as FileShape
    } catch {
      return []
    }
    if (!data || !Array.isArray(data.slotStarts)) return []
    return data.slotStarts.filter((s) => typeof s === 'string' && s.length > 0)
  } catch (e) {
    if (e && typeof e === 'object' && (e as { name?: string }).name === 'BlobNotFoundError') {
      return []
    }
    const { BlobNotFoundError } = await import('@vercel/blob')
    if (e instanceof BlobNotFoundError) return []
    console.error('[eunice] booked slots: blob read', e)
    return []
  }
}

export function listBookedInWindow(
  isos: string[],
  fromIso: string,
  toIso: string,
): string[] {
  return isos.filter((s) => s >= fromIso && s < toIso)
}

/**
 * On Vercel, a booking written only to this instance’s SQLite is not enough — check blob too.
 * Local: SQLite alone is enough when blob is unset.
 */
export async function isSlotStartAlreadyBooked(iso: string): Promise<boolean> {
  const t = iso.trim()
  if (isFlexSlotPlaceholder(t)) return false
  if (hasAppointmentAtSlotStart(t)) return true
  if (!hasBlobStore()) return false
  const fromBlob = await readAllBookedSlotStartsFromBlob()
  return fromBlob.includes(t)
}

/** Call after a successful payment + insert; safe to call multiple times. */
export async function markBookedSlotInBlobAfterPayment(iso: string): Promise<void> {
  if (!hasBlobStore() || isFlexSlotPlaceholder(iso)) return
  const t = iso.trim()
  if (!t) return

  const { put } = await import('@vercel/blob')
  for (let attempt = 0; attempt < 6; attempt++) {
    const current = await readAllBookedSlotStartsFromBlob()
    if (current.includes(t)) return
    const next = mergeUniqueIsos([...current, t])
    const body: FileShape = { slotStarts: next }
    try {
      await put(BLOB_PATH, JSON.stringify(body), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      })
      return
    } catch (e) {
      console.error(`[eunice] booked slots: blob write attempt ${attempt + 1}`, e)
      await new Promise((r) => setTimeout(r, 40 * (attempt + 1)))
    }
  }
  throw new Error('booked_slots_persist_failed')
}
