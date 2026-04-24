import { DateTime } from 'luxon'

const DEFAULT_TZ = 'America/Chicago'

/**
 * Generate hourly slots Mon–Sat, 9:00–16:00 in BUSINESS_TIMEZONE (not server local time).
 * Vercel uses UTC; using the server clock made slots and blocked YMDs disagree.
 */
export function generateCandidateSlots(daysAhead: number): string[] {
  const zone = (process.env.BUSINESS_TIMEZONE || DEFAULT_TZ).trim() || DEFAULT_TZ
  const n = Math.min(21, Math.max(1, daysAhead))
  const slots: string[] = []
  const today = DateTime.now().setZone(zone).startOf('day')
  for (let i = 0; i < n; i++) {
    const day = today.plus({ days: i })
    // 1=Mon … 7=Sun — closed Sunday
    if (day.weekday === 7) continue
    for (let h = 9; h < 17; h++) {
      const slot = day.set({ hour: h, minute: 0, second: 0, millisecond: 0 })
      if (slot.toUTC().toMillis() <= Date.now() + 60 * 60 * 1000) continue
      const iso = slot.toISO()
      if (iso) slots.push(iso)
    }
  }
  return slots.sort()
}
