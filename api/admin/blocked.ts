import type { IncomingMessage, ServerResponse } from 'node:http'
import { deleteBlocked, getBlockedList, postBlocked } from '../../server/adminBlockedService.js'
import { applyCors, sendOptions } from '../../server/vercelCors.js'

export const config = { maxDuration: 10 }

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applyCors(req, res)
  if (req.method === 'OPTIONS') {
    sendOptions(req, res)
    return
  }
  if (req.method === 'GET') {
    const r = await getBlockedList(req)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = r.status
    res.end(JSON.stringify(r.body))
    return
  }
  if (req.method === 'POST') {
    let body: unknown
    try {
      const raw = await readBody(req)
      body = JSON.parse(raw)
    } catch {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'invalid_json' }))
      return
    }
    const r = await postBlocked(req, body)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = r.status
    res.end(JSON.stringify(r.body))
    return
  }
  if (req.method === 'DELETE') {
    const u = new URL(req.url ?? '/', 'http://localhost')
    const date = u.searchParams.get('date')
    const r = await deleteBlocked(req, date)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = r.status
    res.end(JSON.stringify(r.body))
    return
  }
  res.statusCode = 405
  res.end()
}
