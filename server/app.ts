import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { deleteBlocked, getBlockedList, postBlocked } from './adminBlockedService.js'
import { type DepositBody, runDepositPayment } from './depositData.js'
import { getAvailableSlotStarts } from './slotsData.js'

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
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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

  app.get('/api/slots', async (req, res) => {
    try {
      const slots = await getAvailableSlotStarts(req.query.days as string | string[] | undefined)
      res.json({ slots })
    } catch (e) {
      console.error(e)
      return res.status(503).json({ error: 'database_unavailable' })
    }
  })

  app.post('/api/payments/deposit', depositLimiter, async (req, res) => {
    const result = await runDepositPayment(req.body as DepositBody)
    if (!result.ok) {
      return res.status(result.status).json(result.body)
    }
    res.json({ ok: true, paymentId: result.paymentId, customerId: result.customerId })
  })

  app.get('/api/admin/blocked', async (req, res) => {
    const r = await getBlockedList(req)
    res.status(r.status).json(r.body)
  })

  app.post('/api/admin/blocked', async (req, res) => {
    const r = await postBlocked(req, req.body)
    res.status(r.status).json(r.body)
  })

  app.delete('/api/admin/blocked', async (req, res) => {
    const q = req.query.date
    const first = Array.isArray(q) ? q[0] : q
    const date = typeof first === 'string' ? first : null
    const r = await deleteBlocked(req, date)
    res.status(r.status).json(r.body)
  })

  return app
}
