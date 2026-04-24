import type { IncomingMessage, ServerResponse } from 'node:http'
import { getAvailableSlotStarts } from '../server/slotsData.js'
import { applyCors, sendOptions } from '../server/vercelCors.js'

export const config = { maxDuration: 30 }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applyCors(req, res)
  if (req.method === 'OPTIONS') {
    sendOptions(req, res)
    return
  }
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  try {
    const u = new URL(req.url ?? '/', 'http://localhost')
    const days = u.searchParams.get('days') ?? '14'
    const slots = await getAvailableSlotStarts(days)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify({ slots }))
  } catch (e) {
    console.error(e)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'database_unavailable' }))
  }
}
