import type { GeneratedBadge } from '@/badge/export/generateHtml'
import { siteOrigin } from '@/config/site'

/** Where sites load the hosted badge from. */
export function embedSrc(id: string): string {
  return `${siteOrigin()}/e/${id}.js`
}

/** The one line to paste on each site. */
export function embedTag(id: string): string {
  return `<script src="${embedSrc(id)}" async></script>`
}

export class PublishError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

/** Publish the badge under `id`. Resolves with the publish time, or throws a PublishError with a readable message. */
export async function publishBadge(badge: GeneratedBadge, id: string, key: string): Promise<string> {
  let res: Response
  try {
    res = await fetch('/api/publish', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ id, html: badge.html, css: badge.css, js: badge.js, config: badge.config }),
    })
  } catch {
    throw new PublishError("Couldn't reach Stampit. Check your connection.", 0)
  }
  const body = (await res.json().catch(() => ({}))) as { error?: string; updatedAt?: string }
  if (!res.ok || !body.updatedAt) throw new PublishError(body.error ?? `Publishing failed (${res.status}).`, res.status)
  return body.updatedAt
}
