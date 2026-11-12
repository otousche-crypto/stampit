/**
 * The embed and GitHub API in `npm run dev`, without Vercel: same handlers, badges kept
 * in `.stampit-dev/embeds.json`. The publish key is STAMPIT_PUBLISH_TOKEN
 * from `.env.local`, or "dev" when it is not set.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { handleEmbed, handlePublish, type EmbedStore, type PublishedBadge } from './server.ts'
import { handleGithub } from './github.ts'

function fileStore(dir: string): EmbedStore {
  const file = `${dir}/embeds.json`
  const read = (): Record<string, PublishedBadge> => {
    try {
      return JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      return {}
    }
  }
  return {
    async get(id) {
      return read()[id] ?? null
    },
    async set(badge) {
      mkdirSync(dir, { recursive: true })
      writeFileSync(file, JSON.stringify({ ...read(), [badge.id]: badge }, null, 2))
    },
  }
}

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value)
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks)
  return new Request(`http://localhost${req.url}`, { method: req.method, headers, body })
}

async function send(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(Buffer.from(await response.arrayBuffer()))
}

export function embedDevServer({ root, token }: { root: string; token?: string }): Plugin {
  const store = fileStore(`${root}/.stampit-dev`)
  return {
    name: 'stampit-embed-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        if (path === '/api/github') return send(res, await handleGithub(new URL(req.url ?? '', 'http://localhost').searchParams.get('user') ?? ''))
        if (path === '/api/publish') return send(res, await handlePublish(await toRequest(req), store, token || 'dev'))
        const match = path.match(/^\/e\/([A-Za-z0-9]+)\.js$/)
        if (match) return send(res, await handleEmbed(match[1], store))
        next()
      })
    },
  }
}
