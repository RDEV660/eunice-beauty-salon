import { listAllBlockedYmds } from './blockedStore.js'
import { slotIsoToBusinessYmd } from './businessTime.js'

/** Must match `src/lib/slotTbd.ts` — flexible booking when there are no listed slots. */
export const FLEX_PLACEHOLDER_SLOT = '2100-01-01T12:00:00.000Z'

export function isFlexSlotPlaceholder(slotStart: string): boolean {
  return slotStart.trim() === FLEX_PLACEHOLDER_SLOT
}

export async function isSlotYmdBlocked(slotStartIso: string): Promise<boolean> {
  const blocked = new Set(await listAllBlockedYmds())
  return blocked.has(slotIsoToBusinessYmd(slotStartIso))
}
