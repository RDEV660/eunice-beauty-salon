import type { IncomingMessage, ServerResponse } from 'node:http'
import type { DepositBody } from '../../server/depositData.js'
import { runDepositPayment } from '../../server/depositData.js'
import { applyCors, sendOptions } from '../../server/vercelCors.js'

export const config = { maxDuration: 60 }

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
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  let body: DepositBody
  try {
    const raw = await readBody(req)
    body = JSON.parse(raw) as DepositBody
  } catch {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'invalid_json' }))
    return
  }
  const result = await runDepositPayment(body)
  res.setHeader('Content-Type', 'application/json')
  if (result.ok) {
    res.statusCode = 200
    res.end(
      JSON.stringify({
        ok: true,
        paymentId: result.paymentId,
        customerId: result.customerId,
      }),
    )
    return
  }
  res.statusCode = result.status
  res.end(JSON.stringify(result.body))
}
