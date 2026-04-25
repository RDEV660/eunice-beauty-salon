import { randomUUID } from 'node:crypto'
import { SquareError } from 'square'
import { insertAppointment } from './db.js'
import { isFlexSlotPlaceholder, isSlotYmdBlocked } from './slotAvailability.js'
import { getSquareClient } from './squareClientFactory.js'
import { ensureSquareCustomer } from './squareCustomer.js'

/** Cents charged; `BookingSection` `DEPOSIT_AMOUNT_STRING` must match for Square tokenize. */
const DEPOSIT_CENTS = 2500
/** Shown in Square transaction note + stored appointment note for the owner (Texas default). */
const DEFAULT_BUSINESS_TZ = 'America/Chicago'
const MAX_SQUARE_PAYMENT_NOTE_LEN = 500

function formatWhenForOwner(slotStartIso: string): string {
  const tz = process.env.BUSINESS_TIMEZONE?.trim() || DEFAULT_BUSINESS_TZ
  try {
    return new Date(slotStartIso).toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return slotStartIso
  }
}

/** Full text the salon owner sees on the payment in the Square Dashboard. */
function buildSquarePaymentNote(body: DepositBody): string {
  const when = formatWhenForOwner(body.slotStart)
  const lines = [
    `Eunice — deposit: ${body.service.trim()}`,
    `Appt: ${when} (${process.env.BUSINESS_TIMEZONE?.trim() || DEFAULT_BUSINESS_TZ})`,
    `Name: ${body.name.trim()}`,
    `Email: ${body.email.trim()}`,
    `Phone: ${body.phone.trim()}`,
    'Deposit policy: accepted',
  ]
  if (body.note?.trim()) {
    lines.push(`Client request: ${body.note.trim()}`)
  }
  let note = lines.join('\n')
  if (note.length > MAX_SQUARE_PAYMENT_NOTE_LEN) {
    note = `${note.slice(0, MAX_SQUARE_PAYMENT_NOTE_LEN - 1)}…`
  }
  return note
}

/** First lines in the local DB so exports still read clearly if Square is not open. */
function buildStoredAppointmentNote(body: DepositBody): string {
  const when = formatWhenForOwner(body.slotStart)
  const head = `Service: ${body.name.trim()} · ${body.service.trim()}\nWhen: ${when}\n${body.email.trim()} · ${body.phone.trim()}`
  if (body.note?.trim()) {
    return `${head}\n\n${body.note.trim()}`
  }
  return head
}

export type DepositBody = {
  sourceId: string
  idempotencyKey?: string
  name: string
  email: string
  phone: string
  service: string
  slotStart: string
  termsAccepted: boolean
  note?: string
}

export type DepositSuccess = { ok: true; paymentId: string; customerId: string | null }
export type DepositFailure = { ok: false; status: number; body: Record<string, unknown> }

export async function runDepositPayment(body: DepositBody): Promise<DepositSuccess | DepositFailure> {
  if (!body?.termsAccepted) {
    return { ok: false, status: 400, body: { error: 'terms_required' } }
  }
  if (!body.sourceId || typeof body.sourceId !== 'string') {
    return { ok: false, status: 400, body: { error: 'invalid_source' } }
  }
  for (const key of ['name', 'email', 'phone', 'service', 'slotStart'] as const) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      return { ok: false, status: 400, body: { error: 'invalid_fields' } }
    }
  }
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) {
    return { ok: false, status: 500, body: { error: 'server_misconfigured' } }
  }

  if (!isFlexSlotPlaceholder(body.slotStart) && (await isSlotYmdBlocked(body.slotStart))) {
    return { ok: false, status: 409, body: { error: 'slot_blocked' } }
  }

  const idempotencyKey = body.idempotencyKey?.trim() || randomUUID()

  let paymentId: string
  let squareCustomerId: string | undefined
  try {
    const client = await getSquareClient()
    try {
      squareCustomerId = await ensureSquareCustomer(client, {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
      })
    } catch (err) {
      console.error('ensureSquareCustomer', err)
    }

    const resp = await client.payments.create({
      idempotencyKey,
      sourceId: body.sourceId,
      amountMoney: {
        amount: BigInt(DEPOSIT_CENTS),
        currency: 'USD',
      },
      autocomplete: true,
      locationId,
      ...(squareCustomerId ? { customerId: squareCustomerId } : {}),
      note: buildSquarePaymentNote(body),
      buyerEmailAddress: body.email.trim(),
      // Card-not-present, customer pays in the browser (not MOTO) — required by current Square policy.
      customerDetails: {
        customerInitiated: true,
        sellerKeyedIn: false,
      },
    })
    const errors = resp.errors
    if (errors?.length) {
      console.error('Square errors', errors)
      return { ok: false, status: 402, body: { error: 'payment_declined', details: errors } }
    }
    const pay = resp.payment
    if (!pay?.id) {
      return { ok: false, status: 502, body: { error: 'payment_missing' } }
    }
    paymentId = pay.id
  } catch (e) {
    console.error('Square CreatePayment', e)
    if (e instanceof Error && e.message.includes('SQUARE_ACCESS_TOKEN')) {
      return { ok: false, status: 500, body: { error: 'server_misconfigured' } }
    }
    if (e instanceof SquareError) {
      const first = e.errors?.[0]
      const detail =
        typeof first?.detail === 'string' && first.detail.trim()
          ? first.detail.trim().slice(0, 200)
          : undefined
      return {
        ok: false,
        status: 502,
        body: {
          error: 'square_error',
          ...(detail ? { detail } : {}),
        },
      }
    }
    return { ok: false, status: 502, body: { error: 'square_error' } }
  }

  try {
    insertAppointment({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      service: body.service.trim(),
      slotStart: body.slotStart.trim(),
      squarePaymentId: paymentId,
      squareCustomerId,
      note: buildStoredAppointmentNote(body),
    })
  } catch (e) {
    console.error('DB after payment', e)
    return { ok: false, status: 500, body: { error: 'record_failed', paymentId } }
  }

  return { ok: true, paymentId, customerId: squareCustomerId ?? null }
}
