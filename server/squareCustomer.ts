import { randomUUID } from 'node:crypto'
import type { SquareClient } from 'square'

function splitName(full: string): { givenName: string; familyName: string } {
  const p = full.trim().split(/\s+/)
  if (p.length === 0) return { givenName: '', familyName: '' }
  if (p.length === 1) return { givenName: p[0] ?? '', familyName: '' }
  return { givenName: p[0] ?? '', familyName: p.slice(1).join(' ') }
}

/** Prefer E.164 for Square (+1…). */
export function normalizeUsPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return phone.trim()
}

/**
 * Finds a customer by exact email, or creates one so the payment and Square Dashboard stay linked.
 */
export async function ensureSquareCustomer(
  client: SquareClient,
  input: { name: string; email: string; phone: string },
): Promise<string | undefined> {
  const email = input.email.trim()

  const found = await client.customers.search({
    limit: BigInt(5),
    query: {
      filter: {
        emailAddress: { exact: email },
      },
    },
  })
  if (found.errors?.length) {
    console.error('Square searchCustomers', found.errors)
    return undefined
  }
  const existing = found.customers?.[0]
  if (existing?.id) return existing.id

  const { givenName, familyName } = splitName(input.name)
  const phoneNumber = normalizeUsPhone(input.phone)

  const created = await client.customers.create({
    idempotencyKey: randomUUID(),
    givenName: givenName || 'Guest',
    familyName: familyName || undefined,
    emailAddress: email,
    phoneNumber,
    note: 'Online booking — Eunice Beauty Salon',
  })

  if (created.errors?.length) {
    console.error('Square createCustomer', created.errors)
    return undefined
  }
  return created.customer?.id
}
