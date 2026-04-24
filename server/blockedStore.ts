import { isValidYmd } from './dateYmd.js'
import { addBlockedDay, listBlockedDays, removeBlockedDay } from './db.js'

/**
 * Blocked Y-M-D come from, in order:
 * 1) BLOB: one JSON in Vercel Blob when BLOB_READ_WRITE_TOKEN is set (required for /admin to persist
 *    on Vercel serverless — same project, Storage → Blob, paste token; no other vendor).
 * 2) else SQLite (local dev or a single long-lived Node with a real DATABASE_PATH file).
 * 3) BLOCKED_DAYS env (comma-separated) always merged in.
 */
const BLOB_PATH = 'eunice/blocked-ymd.json'

type FileShape = { ymds: string[] }

function parseEnvBlocks(): string[] {
  const raw = process.env.BLOCKED_DAYS?.trim()
  if (!raw) return []
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => isValidYmd(s))
}

function mergeUnique(ymds: string[]): string[] {
  return [...new Set(ymds.filter((s) => isValidYmd(s)))].sort()
}

function hasBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

async function readBlobYmdsFromStore(): Promise<string[] | null> {
  if (!hasBlobStore()) return null
  const { get, BlobNotFoundError } = await import('@vercel/blob')
  try {
    const result = await get(BLOB_PATH, { access: 'private' })
    if (result == null) return []
    if (result.statusCode !== 200 || !result.stream) return []
    const json = await new Response(result.stream as unknown as BodyInit).text()
    const data = JSON.parse(json) as FileShape
    if (!data || !Array.isArray(data.ymds)) return []
    return data.ymds.filter((y): y is string => typeof y === 'string' && isValidYmd(y))
  } catch (e) {
    if (e instanceof BlobNotFoundError) return []
    console.error('[eunice] blocked: blob read', e)
    return null
  }
}

async function writeBlobYmds(ymds: string[]): Promise<void> {
  const { put } = await import('@vercel/blob')
  const body: FileShape = { ymds: mergeUnique(ymds) }
  await put(BLOB_PATH, JSON.stringify(body), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function listAllBlockedYmds(): Promise<string[]> {
  const env = parseEnvBlocks()
  if (hasBlobStore()) {
    const fromBlob = await readBlobYmdsFromStore()
    if (fromBlob == null) {
      let sql: string[] = []
      try {
        sql = listBlockedDays()
      } catch (e) {
        console.error('[eunice] blocked: sqlite fallback', e)
      }
      return mergeUnique([...env, ...sql])
    }
    return mergeUnique([...env, ...fromBlob])
  }
  let sql: string[] = []
  try {
    sql = listBlockedDays()
  } catch (e) {
    console.error('[eunice] blocked: sqlite', e)
  }
  return mergeUnique([...env, ...sql])
}

export async function addBlockedYmd(ymd: string): Promise<void> {
  if (!isValidYmd(ymd)) return
  if (hasBlobStore()) {
    const cur = (await readBlobYmdsFromStore()) ?? []
    if (!cur.includes(ymd)) cur.push(ymd)
    await writeBlobYmds(cur)
    return
  }
  addBlockedDay(ymd)
}

export async function removeBlockedYmd(ymd: string): Promise<number> {
  if (!isValidYmd(ymd)) return 0
  if (hasBlobStore()) {
    const cur = (await readBlobYmdsFromStore()) ?? []
    const next = cur.filter((x) => x !== ymd)
    const removed = cur.length - next.length
    await writeBlobYmds(next)
    return removed
  }
  return removeBlockedDay(ymd)
}
