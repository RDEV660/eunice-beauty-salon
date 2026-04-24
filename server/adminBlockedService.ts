import { addBlockedDay, listBlockedDays, removeBlockedDay } from './db.js'
import { isValidYmd } from './dateYmd.js'
import { getAdminBearerFromRequest, isAdminPasswordConfigured, isAdminToken } from './adminAuth.js'
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

export function getBlockedList(req: { headers: IncomingMessage['headers'] }) {
  if (!isAdminPasswordConfigured()) return adminNotConfiguredBody()
  if (!isAdminToken(getAdminBearerFromRequest({ headers: req.headers })))
    return unauthorizedBody()
  return { status: 200, body: { dates: listBlockedDays() } as Json }
}

export function postBlocked(
  req: { headers: IncomingMessage['headers'] },
  body: unknown,
): { status: number; body: Json } {
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
  addBlockedDay(date)
  return { status: 200, body: { ok: true, dates: listBlockedDays() } }
}

export function deleteBlocked(
  req: { headers: IncomingMessage['headers'] },
  date: string | null,
): { status: number; body: Json } {
  if (!isAdminPasswordConfigured()) return adminNotConfiguredBody()
  if (!isAdminToken(getAdminBearerFromRequest({ headers: req.headers })))
    return unauthorizedBody()
  if (!date || !isValidYmd(date)) {
    return { status: 400, body: { error: 'invalid_date' } }
  }
  const removed = removeBlockedDay(date)
  return { status: 200, body: { ok: true, removed, dates: listBlockedDays() } }
}
