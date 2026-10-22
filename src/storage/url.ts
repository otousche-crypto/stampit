import { createDefaultConfig, parseConfig, type BadgeConfig, type ParseResult } from '@/badge/schema'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Reference defaults for diffing: fixed id and date so they never count as "changed". */
const DIFF_BASE = createDefaultConfig({ id: 'x', updatedAt: '' })

/** Keep only what differs from `base`. Arrays compare as a whole. */
function diff(value: unknown, base: unknown): unknown {
  if (isObject(value) && isObject(base)) {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      const d = diff(v, base[key])
      if (d !== undefined) out[key] = d
    }
    return Object.keys(out).length ? out : undefined
  }
  return JSON.stringify(value) === JSON.stringify(base) ? undefined : value
}

/** §10 step 1 — drop default values, always keep `schemaVersion` (and the badge id). */
export function stripDefaults(config: BadgeConfig): Record<string, unknown> {
  const { updatedAt: _updatedAt, id, schemaVersion, ...rest } = config
  const { updatedAt: _u, id: _i, schemaVersion: _s, ...baseRest } = DIFF_BASE
  const d = (diff(rest, baseRest) as Record<string, unknown> | undefined) ?? {}
  return { schemaVersion, id, ...d }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

/** §10 — JSON → deflate-raw → base64url. */
export async function encodeConfig(config: BadgeConfig): Promise<string> {
  const json = JSON.stringify(stripDefaults(config))
  const compressed = await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw'))
  return toBase64Url(compressed)
}

/** Decode → merge with defaults → migrate → validate. */
export async function decodeConfig(encoded: string): Promise<ParseResult> {
  try {
    const bytes = await pipe(fromBase64Url(decodeURIComponent(encoded)), new DecompressionStream('deflate-raw'))
    const raw: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return parseConfig(raw, createDefaultConfig())
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unreadable link' }
  }
}

/** The `c` parameter of a `#c=…` hash, if any. */
export function readHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return params.get('c')
}

export async function editLink(config: BadgeConfig, base: string): Promise<string> {
  return `${base}#c=${await encodeConfig(config)}`
}
