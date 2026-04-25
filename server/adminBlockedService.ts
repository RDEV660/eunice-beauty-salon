import { isValidYmd } from './dateYmd.js'
import { getAdminBearerFromRequest, isAdminPasswordConfigured, isAdminToken } from './adminAuth.js'
import { addBlockedYmd, listAllBlockedYmds, listStaffBlockedYmds, removeBlockedYmd } from './blockedStore.js'
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
  try {
    const dates = await listAllBlockedYmds()
    const staffYmds = await listStaffBlockedYmds()
    return { status: 200, body: { dates: dates as Json, staffYmds: staffYmds as Json } }
  } catch (e) {
    console.error('[eunice] getBlockedList', e)
    return { status: 503, body: { error: 'block_list_failed' } as Json }
  }
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
  try {
    await addBlockedYmd(date)
    const dates = await listAllBlockedYmds()
    const staffYmds = await listStaffBlockedYmds()
    return { status: 200, body: { ok: true, dates: dates as Json, staffYmds: staffYmds as Json } }
  } catch (e) {
    console.error('[eunice] postBlocked', e)
    return { status: 503, body: { error: 'block_persist_failed' } as Json }
  }
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
  try {
    const removed = await removeBlockedYmd(date)
    const dates = await listAllBlockedYmds()
    const staffYmds = await listStaffBlockedYmds()
    return { status: 200, body: { ok: true, removed, dates: dates as Json, staffYmds: staffYmds as Json } }
  } catch (e) {
    console.error('[eunice] deleteBlocked', e)
    return { status: 503, body: { error: 'block_persist_failed' } as Json }
  }
}
