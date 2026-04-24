import { createHash, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage } from 'node:http'

type HeadersLike = Pick<IncomingMessage, 'headers'>

function bearerFromHeader(authorization: string | string[] | undefined): string | undefined {
  if (Array.isArray(authorization)) {
    if (!authorization[0] || !authorization[0].startsWith('Bearer ')) return undefined
    return authorization[0].slice(7).trim()
  }
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return undefined
  return authorization.slice(7).trim()
}

/** Reads `Authorization: Bearer …` (Express or Node IncomingMessage). */
export function getAdminBearerFromRequest(req: HeadersLike): string | undefined {
  const a = req.headers['authorization'] ?? (req.headers as { Authorization?: string }).Authorization
  return bearerFromHeader(a)
}

export function isAdminToken(token: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !token) return false
  return timingSafeEqual(
    createHash('sha256').update(token, 'utf8').digest(),
    createHash('sha256').update(expected, 'utf8').digest(),
  )
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}
