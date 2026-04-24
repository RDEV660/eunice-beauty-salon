import type { IncomingMessage, ServerResponse } from 'node:http'

type MinReq = Pick<IncomingMessage, 'method' | 'headers'>
type MinRes = Pick<ServerResponse, 'setHeader' | 'statusCode' | 'end'>

export function applyCors(req: MinReq, res: MinRes): void {
  const allowed = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const origin = (req.headers as { origin?: string }).origin
  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else if (allowed.length === 1) {
    res.setHeader('Access-Control-Allow-Origin', allowed[0] ?? '')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

export function sendOptions(req: MinReq, res: MinRes): void {
  applyCors(req, res)
  res.statusCode = 204
  res.end()
}
