// Stable unique ids for sections and chord spans. Uses crypto.randomUUID when
// available (browsers and modern Node), with a simple fallback.

let counter = 0

export function newId(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  counter += 1
  return `id-${counter}-${counter * 2654435761}`
}
