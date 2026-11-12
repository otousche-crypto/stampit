/**
 * Hosted badge ("embed"): the editor publishes the generated snippet, and
 * every site that carries `<script src="/e/{id}.js">` shows the latest one.
 * Only the owner can publish for now: one secret, STAMPIT_PUBLISH_TOKEN.
 *
 * Runs in Vercel functions (`api/`) and in the Vite dev server, so relative
 * imports only and nothing browser-specific.
 */

/** What a publish stores: the snippet's parts, and the settings it came from. */
export type PublishedBadge = {
  id: string
  html: string
  css: string
  js: string | null
  config: unknown
  updatedAt: string
}

export type EmbedStore = {
  get(id: string): Promise<PublishedBadge | null>
  set(badge: PublishedBadge): Promise<void>
}

const ID_RE = /^[A-Za-z0-9]{1,32}$/
/** A full profile badge is ~20 KB; anything far beyond is not a badge. */
const MAX_BYTES = 200_000

/** Sites pick up a new version within a minute; a stale copy may serve while it refreshes. */
const EMBED_CACHE = 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400'

export function isEmbedId(id: unknown): id is string {
  return typeof id === 'string' && ID_RE.test(id)
}

/** Same length and content, without leaking where they differ through timing. */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** POST /api/publish — `Authorization: Bearer <token>`, body `{ id, html, css, js, config }`. */
export async function handlePublish(request: Request, store: EmbedStore, token: string | undefined): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'Use POST.' })
  if (!token) return json(503, { error: 'Publishing is not set up: STAMPIT_PUBLISH_TOKEN is missing.' })
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!sameSecret(given, token)) return json(401, { error: 'Wrong publish key.' })

  const text = await request.text()
  if (text.length > MAX_BYTES) return json(413, { error: 'Badge too large.' })
  let body: Record<string, unknown>
  try {
    body = JSON.parse(text)
  } catch {
    return json(400, { error: 'Not JSON.' })
  }
  const { id, html, css, js, config } = body
  if (!isEmbedId(id) || typeof html !== 'string' || typeof css !== 'string' || (js !== null && typeof js !== 'string')) {
    return json(400, { error: 'Expected { id, html, css, js, config }.' })
  }
  const badge: PublishedBadge = { id, html, css, js, config: config ?? null, updatedAt: new Date().toISOString() }
  await store.set(badge)
  return json(200, { id, updatedAt: badge.updatedAt })
}

/** GET /e/{id}.js — the script that draws the published badge where it is placed. */
export async function handleEmbed(id: string, store: EmbedStore): Promise<Response> {
  const headers = { 'content-type': 'text/javascript; charset=utf-8', 'access-control-allow-origin': '*' }
  const badge = isEmbedId(id) ? await store.get(id) : null
  if (!badge) {
    return new Response(`console.warn("Stampit: no published badge ${isEmbedId(id) ? id : ''}");\n`, {
      status: 404,
      headers: { ...headers, 'cache-control': 'public, max-age=60' },
    })
  }
  return new Response(embedScript(badge), { headers: { ...headers, 'cache-control': EMBED_CACHE } })
}

/**
 * The embed script: puts the badge's markup in place of its own <script>
 * tag, its CSS once per page in <head>, and runs the badge's script right
 * after the markup (where the badge runtime looks for it).
 */
export function embedScript(badge: Pick<PublishedBadge, 'id' | 'html' | 'css' | 'js' | 'updatedAt'>): string {
  // JSON strings are valid JS; `<` escaped so "</script>" in user text can't close anything.
  const lit = (value: string | null) => JSON.stringify(value).replace(/</g, '\\u003c')
  return `/* Stampit badge ${badge.id} · ${badge.updatedAt} */
(function () {
  var s = document.currentScript;
  if (!s || !s.parentNode) return;
  var css = ${lit(badge.css)}, html = ${lit(badge.html)}, js = ${lit(badge.js)}, id = "stampit-${badge.id}";
  if (!document.getElementById(id)) {
    var st = document.createElement("style");
    st.id = id;
    st.textContent = css;
    document.head.appendChild(st);
  }
  var t = document.createElement("template");
  t.innerHTML = html.trim();
  var root = t.content.firstElementChild;
  if (!root) return;
  s.parentNode.insertBefore(root, s);
  if (js) {
    var x = document.createElement("script");
    x.textContent = js;
    root.parentNode.insertBefore(x, root.nextSibling);
  }
})();
`
}

/** Upstash Redis over its REST API (the Vercel marketplace integration), no client library. */
export function redisStore(url: string, token: string): EmbedStore {
  const call = async (command: unknown[]) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(command),
    })
    if (!res.ok) throw new Error(`Redis ${res.status}`)
    return ((await res.json()) as { result: unknown }).result
  }
  return {
    async get(id) {
      const raw = await call(['GET', `stampit:badge:${id}`])
      return typeof raw === 'string' ? (JSON.parse(raw) as PublishedBadge) : null
    },
    async set(badge) {
      await call(['SET', `stampit:badge:${badge.id}`, JSON.stringify(badge)])
    },
  }
}

/** The production store, from the integration's environment variables. */
export function storeFromEnv(env: Record<string, string | undefined>): EmbedStore | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? redisStore(url, token) : null
}
