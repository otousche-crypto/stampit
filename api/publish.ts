import { handlePublish, storeFromEnv } from '../src/embed/server.js'

/** POST /api/publish — the owner publishes the badge from the editor. */
export async function POST(request: Request): Promise<Response> {
  const store = storeFromEnv(process.env)
  if (!store) return Response.json({ error: 'Storage is not set up: connect Upstash Redis to the project.' }, { status: 503 })
  return handlePublish(request, store, process.env.STAMPIT_PUBLISH_TOKEN)
}
