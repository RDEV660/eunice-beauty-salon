import { listBlockedDays } from './db.js'
import { slotIsoToBusinessYmd } from './businessTime.js'

/** Must match `src/lib/slotTbd.ts` — flexible booking when there are no listed slots. */
export const FLEX_PLACEHOLDER_SLOT = '2100-01-01T12:00:00.000Z'

export function isFlexSlotPlaceholder(slotStart: string): boolean {
  return slotStart.trim() === FLEX_PLACEHOLDER_SLOT
}

export function isSlotYmdBlocked(slotStartIso: string): boolean {
  const blocked = new Set(listBlockedDays())
  return blocked.has(slotIsoToBusinessYmd(slotStartIso))
}
