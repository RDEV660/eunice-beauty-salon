/** API base for fetch (empty = same origin; Vite dev proxies `/api`). */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
