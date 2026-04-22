/**
 * Generate hourly slots Mon–Sat, 9:00–17:00 local (America/Chicago heuristic for TX salon).
 * Returns ISO strings for slot starts.
 */
export function generateCandidateSlots(daysAhead: number): string[] {
  const slots: string[] = []
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + daysAhead)

  for (let d = new Date(now); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day === 0) continue
    for (let h = 9; h < 17; h++) {
      const slot = new Date(d)
      slot.setHours(h, 0, 0, 0)
      if (slot.getTime() <= Date.now() + 60 * 60 * 1000) continue
      slots.push(slot.toISOString())
    }
  }
  return slots.sort()
}
