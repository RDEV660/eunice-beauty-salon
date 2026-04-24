/** Business calendar date (YYYY-MM-DD) for a slot in ISO form, in BUSINESS_TIMEZONE. */
export function slotIsoToBusinessYmd(iso: string): string {
  const tz = process.env.BUSINESS_TIMEZONE || 'America/Chicago'
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: tz })
}
