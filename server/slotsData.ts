import { getDb, listBookedSlotStarts } from './db.js'
import { listAllBlockedYmds } from './blockedStore.js'
import { listBookedInWindow, readAllBookedSlotStartsFromBlob } from './bookedSlotsStore.js'
import { slotIsoToBusinessYmd } from './businessTime.js'
import { generateCandidateSlots } from './slots.js'

/** Shared by Express and Vercel `api/slots` (lean bundle, no Express). */
export async function getAvailableSlotStarts(
  daysParam: string | string[] | undefined,
): Promise<string[]> {
  getDb()
  const days = Math.min(21, Math.max(1, Number(Array.isArray(daysParam) ? daysParam[0] : daysParam) || 14))
  const candidates = generateCandidateSlots(days)
  const from = candidates[0] ?? new Date().toISOString()
  const to = candidates[candidates.length - 1]
    ? new Date(new Date(candidates[candidates.length - 1]).getTime() + 60 * 60 * 1000).toISOString()
    : from
  let booked: string[] = []
  try {
    booked = listBookedSlotStarts(from, to)
  } catch {
    booked = []
  }
  const fromBlob = listBookedInWindow(await readAllBookedSlotStartsFromBlob(), from, to)
  const bookedSet = new Set([...booked, ...fromBlob])
  const blocked = new Set(await listAllBlockedYmds())
  return candidates.filter(
    (s) => !bookedSet.has(s) && !blocked.has(slotIsoToBusinessYmd(s)),
  )
}
