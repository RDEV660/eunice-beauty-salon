import { DateTime } from 'luxon'

const DEFAULT_TZ = 'America/Chicago'

/**
 * Calendar day (YYYY-MM-DD) in BUSINESS_TIMEZONE for a slot instant.
 * Uses Luxon (same as slot generation) so blocks match the dropdown.
 */
export function slotIsoToBusinessYmd(iso: string): string {
  const tz = (process.env.BUSINESS_TIMEZONE || DEFAULT_TZ).trim() || DEFAULT_TZ
  const t = DateTime.fromISO(iso)
  if (!t.isValid) return '1970-01-15'
  return t.setZone(tz).toISODate()!
}
