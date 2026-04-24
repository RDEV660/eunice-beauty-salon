import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { randomUUID } from 'node:crypto'
import type { SquareClient } from 'square'
import { getDb, insertAppointment, listBookedSlotStarts } from './db.js'
import { ensureSquareCustomer } from './squareCustomer.js'
import { generateCandidateSlots } from './slots.js'

const DEPOSIT_CENTS = 2500

/** Dynamic import keeps `square` off the cold path (e.g. /api/health) and speeds Vercel cold starts. */
let squareMod: typeof import('square') | null = null
async function getSquareClient(): Promise<SquareClient> {
  if (!squareMod) squareMod = await import('square')
  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) {
    throw new Error('SQUARE_ACCESS_TOKEN is not set')
  }
  const environment =
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? squareMod.SquareEnvironment.Production
      : squareMod.SquareEnvironment.Sandbox
  return new squareMod.SquareClient({ token, environment })
}

export function createApp() {
  const app = express()
  app.set('trust proxy', 1)

  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '64kb' }))

  const depositLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.get('/api', (_req, res) => {
    res.redirect(302, '/')
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/slots', (req, res) => {
    try {
      getDb()
    } catch (e) {
      console.error(e)
      return res.status(503).json({ error: 'database_unavailable' })
    }
    const days = Math.min(21, Math.max(1, Number(req.query.days) || 14))
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
    const bookedSet = new Set(booked)
    const available = candidates.filter((s) => !bookedSet.has(s))
    res.json({ slots: available })
  })

  type DepositBody = {
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

  app.post('/api/payments/deposit', depositLimiter, async (req, res) => {
    const body = req.body as DepositBody
    if (!body?.termsAccepted) {
      return res.status(400).json({ error: 'terms_required' })
    }
    if (!body.sourceId || typeof body.sourceId !== 'string') {
      return res.status(400).json({ error: 'invalid_source' })
    }
    for (const key of ['name', 'email', 'phone', 'service', 'slotStart'] as const) {
      if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
        return res.status(400).json({ error: 'invalid_fields' })
      }
    }
    const locationId = process.env.SQUARE_LOCATION_ID
    if (!locationId) {
      return res.status(500).json({ error: 'server_misconfigured' })
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
        return res.status(402).json({ error: 'payment_declined', details: errors })
      }
      const pay = resp.payment
      if (!pay?.id) {
        return res.status(502).json({ error: 'payment_missing' })
      }
      paymentId = pay.id
    } catch (e) {
      console.error(e)
      return res.status(502).json({ error: 'square_error' })
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
      return res.status(500).json({ error: 'record_failed', paymentId })
    }

    res.json({ ok: true, paymentId, customerId: squareCustomerId ?? null })
  })

  return app
}
