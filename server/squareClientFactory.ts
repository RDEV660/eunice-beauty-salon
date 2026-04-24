import type { SquareClient } from 'square'

/** Dynamic import keeps the Square SDK out of the cold path for /api/health and /api/slots. */
let squareMod: typeof import('square') | null = null
export async function getSquareClient(): Promise<SquareClient> {
  if (!squareMod) squareMod = await import('square')
  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) {
    throw new Error('SQUARE_ACCESS_TOKEN is not set')
  }
  const environment =
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? squareMod.SquareEnvironment.Production
      : squareMod.SquareEnvironment.Sandbox
  return new squareMod.SquareClient({ token, environment })
}
