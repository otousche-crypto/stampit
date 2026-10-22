import { describe, expect, it } from 'vitest'
import { FIXTURES } from '@/badge/export/fixtures'
import { createDefaultConfig, mergeDeep } from '@/badge/schema'
import { decodeConfig, encodeConfig, readHash, stripDefaults } from './url'

describe('url storage', () => {
  it('round-trips every fixture', async () => {
    for (const config of Object.values(FIXTURES)) {
      const encoded = await encodeConfig(config)
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
      const decoded = await decodeConfig(encoded)
      expect(decoded.ok).toBe(true)
      if (decoded.ok) {
        const { updatedAt: _a, ...got } = decoded.config
        const { updatedAt: _b, ...want } = config
        expect(got).toEqual(want)
      }
    }
  })

  it('keeps the hash short', async () => {
    const defaults = await encodeConfig(createDefaultConfig({ id: 'abc12345' }))
    expect(defaults.length).toBeLessThan(80)
    // Typical badges land in the 200–500 target; 8 full links run a bit over.
    expect((await encodeConfig(FIXTURES['bubbles-2'])).length).toBeLessThan(500)
    expect((await encodeConfig(FIXTURES['bubbles-8'])).length).toBeLessThan(700)
  })

  it('strips defaults but keeps schemaVersion and id', () => {
    expect(stripDefaults(createDefaultConfig({ id: 'abc12345' }))).toEqual({ schemaVersion: 1, id: 'abc12345' })
    const changed = mergeDeep(createDefaultConfig({ id: 'abc12345' }), { text: { bold: 'Ada' } })
    expect(stripDefaults(changed)).toEqual({ schemaVersion: 1, id: 'abc12345', text: { bold: 'Ada' } })
  })

  it('rejects unreadable or invalid links', async () => {
    expect((await decodeConfig('not-a-config')).ok).toBe(false)
    expect((await decodeConfig('')).ok).toBe(false)
    const wrong = mergeDeep(createDefaultConfig({ id: 'abc12345' }), { text: { size: 'xxl' } })
    expect((await decodeConfig(await encodeConfig(wrong))).ok).toBe(false)
  })

  it('migrates: missing schemaVersion is read as v1, future versions are refused', async () => {
    const enc = async (obj: unknown) => {
      const bytes = new TextEncoder().encode(JSON.stringify(obj))
      const out = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
      const buf = new Uint8Array(await new Response(out).arrayBuffer())
      return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }
    const v1 = await decodeConfig(await enc({ id: 'old1', text: { bold: 'Legacy' } }))
    expect(v1.ok && v1.config.text.bold).toBe('Legacy')
    expect(v1.ok && v1.config.schemaVersion).toBe(1)
    expect((await decodeConfig(await enc({ schemaVersion: 99, id: 'new1' }))).ok).toBe(false)
  })

  it('reads the c parameter', () => {
    expect(readHash('#c=abc-_')).toBe('abc-_')
    expect(readHash('')).toBeNull()
  })
})
