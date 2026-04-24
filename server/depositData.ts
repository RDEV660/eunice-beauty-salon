import { randomUUID } from 'node:crypto'
import { insertAppointment } from './db.js'
import { getSquareClient } from './squareClientFactory.js'
import { ensureSquareCustomer } from './squareCustomer.js'

const DEPOSIT_CENTS = 2500

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
      note: `Deposit — ${body.service} @ ${body.slotStart}`,
      buyerEmailAddress: body.email.trim(),
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
    console.error(e)
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
      note: body.note?.trim(),
    })
  } catch (e) {
    console.error('DB after payment', e)
    return { ok: false, status: 500, body: { error: 'record_failed', paymentId } }
  }

  return { ok: true, paymentId, customerId: squareCustomerId ?? null }
}
