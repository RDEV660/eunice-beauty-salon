import type { IncomingMessage, ServerResponse } from 'node:http'
import { applyCors, sendOptions } from '../server/vercelCors.js'

export const config = { maxDuration: 10 }

export default function handler(req: IncomingMessage, res: ServerResponse) {
  applyCors(req, res)
  if (req.method === 'OPTIONS') {
    sendOptions(req, res)
    return
  }
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify({ ok: true }))
}
