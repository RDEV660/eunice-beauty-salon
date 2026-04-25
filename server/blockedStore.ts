import { isValidYmd } from './dateYmd.js'
import { addBlockedDay, listBlockedDays, removeBlockedDay } from './db.js'

/**
 * Staff-blocked Y-M-D: always merge
 * - SQLite (works on one machine with data/appointments.sqlite)
 * - Vercel Blob (when BLOB_READ_WRITE_TOKEN is set — shared on serverless)
 * - BLOCKED_DAYS env (extra dates, e.g. holidays)
 *
 * On add/remove we always update SQLite, then if Blob is enabled we rewrite the file from
 * SQLite ∪ previous blob + new/removed, so a failing SQLite write still can succeed on Blob
 * and local dev without a token only uses SQLite.
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

/** Always returns an array. Logs and returns [] on failure (never null). */
async function readBlobYmdsFromStore(): Promise<string[]> {
  if (!hasBlobStore()) return []
  try {
    const { get } = await import('@vercel/blob')
    const result = await get(BLOB_PATH, { access: 'private', useCache: false })
    if (result == null) return []
    if (result.statusCode !== 200 || !result.stream) return []
    const json = await new Response(result.stream as unknown as BodyInit).text()
    let data: FileShape
    try {
      data = JSON.parse(json) as FileShape
    } catch {
      return []
    }
    if (!data || !Array.isArray(data.ymds)) return []
    return data.ymds.filter((y): y is string => typeof y === 'string' && isValidYmd(y))
  } catch (e) {
    if (e && typeof e === 'object' && (e as { name?: string }).name === 'BlobNotFoundError') {
      return []
    }
    const { BlobNotFoundError } = await import('@vercel/blob')
    if (e instanceof BlobNotFoundError) return []
    console.error('[eunice] blocked: blob read', e)
    return []
  }
}

async function writeBlobYmds(ymds: string[]): Promise<void> {
  if (!hasBlobStore()) return
  const { put } = await import('@vercel/blob')
  const body: FileShape = { ymds: mergeUnique(ymds) }
  await put(BLOB_PATH, JSON.stringify(body), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

function listSqliteYmdsOrEmpty(): string[] {
  try {
    return listBlockedDays()
  } catch (e) {
    console.error('[eunice] blocked: sqlite list', e)
    return []
  }
}

/**
 * All blocked calendar days: env + SQLite + Blob (deduped). Any source may be empty.
 */
/** Y-M-D the staff can add/remove in admin (not from BLOCKED_DAYS). */
export async function listStaffBlockedYmds(): Promise<string[]> {
  return mergeUnique([...listSqliteYmdsOrEmpty(), ...(hasBlobStore() ? await readBlobYmdsFromStore() : [])])
}

export async function listAllBlockedYmds(): Promise<string[]> {
  const env = parseEnvBlocks()
  const sql = listSqliteYmdsOrEmpty()
  const fromBlob = hasBlobStore() ? await readBlobYmdsFromStore() : []
  return mergeUnique([...env, ...sql, ...fromBlob])
}

export async function addBlockedYmd(ymd: string): Promise<void> {
  if (!isValidYmd(ymd)) return

  try {
    addBlockedDay(ymd)
  } catch (e) {
    console.error('[eunice] blocked: addBlockedDay', e)
  }

  if (hasBlobStore()) {
    try {
      const next = mergeUnique([...listSqliteYmdsOrEmpty(), ...(await readBlobYmdsFromStore()), ymd])
      await writeBlobYmds(next)
    } catch (e) {
      console.error('[eunice] blocked: blob put after add', e)
    }
  }
}

export async function removeBlockedYmd(ymd: string): Promise<number> {
  if (!isValidYmd(ymd)) return 0
  let removed = 0
  try {
    removed = removeBlockedDay(ymd)
  } catch (e) {
    console.error('[eunice] blocked: removeBlockedDay', e)
  }

  if (hasBlobStore()) {
    try {
      const next = mergeUnique([...listSqliteYmdsOrEmpty(), ...(await readBlobYmdsFromStore())]).filter(
        (d) => d !== ymd,
      )
      await writeBlobYmds(next)
    } catch (e) {
      console.error('[eunice] blocked: blob put after remove', e)
    }
  }
  return removed
}
