import { handleEmbed, storeFromEnv } from '../src/embed/server'

/** GET /e/{id}.js (rewritten to /api/embed?id={id}) — the hosted badge. */
export async function GET(request: Request): Promise<Response> {
  const store = storeFromEnv(process.env)
  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!store) return new Response('console.warn("Stampit: storage is not set up");\n', { status: 503, headers: { 'content-type': 'text/javascript' } })
  return handleEmbed(id, store)
}
