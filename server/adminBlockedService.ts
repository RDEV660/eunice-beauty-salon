import { isValidYmd } from './dateYmd.js'
import { getAdminBearerFromRequest, isAdminPasswordConfigured, isAdminToken } from './adminAuth.js'
import { addBlockedYmd, listAllBlockedYmds, removeBlockedYmd } from './blockedStore.js'
import type { IncomingMessage } from 'node:http'

type Json =
  | string
  | number
  | boolean
  | null
  | { [k: string]: Json }
  | Json[]

export function adminNotConfiguredBody(): { status: number; body: Json } {
  return { status: 501, body: { error: 'admin_not_configured' } }
}

export function unauthorizedBody(): { status: number; body: Json } {
  return { status: 401, body: { error: 'unauthorized' } }
}

export async function getBlockedList(req: { headers: IncomingMessage['headers'] }): Promise<{
  status: number
  body: Json
}> {
  if (!isAdminPasswordConfigured()) return adminNotConfiguredBody()
  if (!isAdminToken(getAdminBearerFromRequest({ headers: req.headers })))
    return unauthorizedBody()
  return { status: 200, body: { dates: (await listAllBlockedYmds()) as Json } }
}

export async function postBlocked(
  req: { headers: IncomingMessage['headers'] },
  body: unknown,
): Promise<{ status: number; body: Json }> {
  if (!isAdminPasswordConfigured()) return adminNotConfiguredBody()
  if (!isAdminToken(getAdminBearerFromRequest({ headers: req.headers })))
    return unauthorizedBody()
  if (typeof body !== 'object' || body === null || !('date' in body)) {
    return { status: 400, body: { error: 'invalid_json' } }
  }
  const date = (body as { date: unknown }).date
  if (typeof date !== 'string' || !isValidYmd(date)) {
    return { status: 400, body: { error: 'invalid_date' } }
  }
  await addBlockedYmd(date)
  return { status: 200, body: { ok: true, dates: (await listAllBlockedYmds()) as Json } }
}

export async function deleteBlocked(
  req: { headers: IncomingMessage['headers'] },
  date: string | null,
): Promise<{ status: number; body: Json }> {
  if (!isAdminPasswordConfigured()) return adminNotConfiguredBody()
  if (!isAdminToken(getAdminBearerFromRequest({ headers: req.headers })))
    return unauthorizedBody()
  if (!date || !isValidYmd(date)) {
    return { status: 400, body: { error: 'invalid_date' } }
  }
  const removed = await removeBlockedYmd(date)
  return { status: 200, body: { ok: true, removed, dates: (await listAllBlockedYmds()) as Json } }
}
