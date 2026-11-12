import { describe, expect, it } from 'vitest'
import { embedScript, handleEmbed, handlePublish, type EmbedStore, type PublishedBadge } from './server'
import { generateBadge } from '../badge/export/generateHtml'
import { FIXTURES } from '../badge/export/fixtures'

function memoryStore(): EmbedStore {
  const badges = new Map<string, PublishedBadge>()
  return { get: async (id) => badges.get(id) ?? null, set: async (b) => void badges.set(b.id, b) }
}

const publish = (body: unknown, auth = 'Bearer secret') =>
  new Request('http://x/api/publish', { method: 'POST', headers: { authorization: auth }, body: JSON.stringify(body) })

const badge = generateBadge(FIXTURES['profile-full'])
const payload = { id: 'test1234', html: badge.html, css: badge.css, js: badge.js, config: badge.config }

describe('embed', () => {
  it('publishes only with the owner key', async () => {
    const store = memoryStore()
    expect((await handlePublish(publish(payload), store, undefined)).status).toBe(503)
    expect((await handlePublish(publish(payload, 'Bearer nope'), store, 'secret')).status).toBe(401)
    expect((await handlePublish(publish({ ...payload, id: '../x' }), store, 'secret')).status).toBe(400)
    expect(await store.get('test1234')).toBeNull()
    expect((await handlePublish(publish(payload), store, 'secret')).status).toBe(200)
    expect((await store.get('test1234'))?.html).toBe(badge.html)
  })

  it('serves the latest published badge as a cacheable script', async () => {
    const store = memoryStore()
    expect((await handleEmbed('test1234', store)).status).toBe(404)
    await handlePublish(publish(payload), store, 'secret')
    const res = await handleEmbed('test1234', store)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('javascript')
    expect(res.headers.get('cache-control')).toContain('s-maxage=60')
    const js = await res.text()
    expect(() => new Function(js)).not.toThrow()
    expect(js).toContain('stampit-test1234')
  })

  it('never lets user text close the script', () => {
    const js = embedScript({ id: 'a', html: '<div class="x">"</script><script>alert(1)</script></div>', css: '', js: null, updatedAt: 'now' })
    expect(js).not.toContain('</script>')
    expect(() => new Function(js)).not.toThrow()
  })
})
