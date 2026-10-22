import { describe, expect, it } from 'vitest'
import { generateBadge, generateHtml, deriveInitials, badgeText } from './generateHtml'
import { FIXTURES } from './fixtures'
import { createDefaultConfig, mergeDeep } from '../schema'

describe('generateHtml', () => {
  for (const [name, config] of Object.entries(FIXTURES)) {
    it(`snapshot: ${name}`, () => {
      expect(generateHtml(config, { editUrl: 'https://stampit.example/create#c=abc--def' })).toMatchSnapshot()
    })
  }

  it('is pure', () => {
    const config = FIXTURES['link-initials']
    expect(generateHtml(config)).toBe(generateHtml(config))
  })

  it('keeps the header comment valid', () => {
    const code = generateHtml(FIXTURES['link-initials'], { editUrl: 'https://x.test/create#c=a--b' })
    const header = code.split('\n')[0]
    expect(header.slice(4, -3)).not.toContain('--')
  })

  it('emits only the CSS it needs', () => {
    const link = generateBadge(FIXTURES['link-initials'])
    expect(link.css).not.toContain('prefers-color-scheme')
    expect(link.css).not.toContain('backdrop-filter')
    expect(link.css).not.toContain('__menu')
    expect(link.js).toBeNull()
    expect(generateBadge(FIXTURES.glass).css).toContain('backdrop-filter:blur(')
    expect(generateBadge(FIXTURES.adaptive).css).toContain('@media (prefers-color-scheme:dark)')
  })

  it('reproduces the Décadi badge in Light / M', () => {
    const { css } = generateBadge(FIXTURES['link-initials'])
    expect(css).toContain('height:36px')
    expect(css).toContain('padding:0 12px 0 4px')
    expect(css).toContain('gap:8px')
    expect(css).toContain('font-size:15px')
    expect(css).toContain('width:28px')
    expect(css).toContain('box-shadow:inset 0 0 0 1px var(--sp-test1234-bd),0 1px 6px rgba(0,0,0,.08)')
    expect(css).toContain('0 2px 12px rgba(0,0,0,.12)')
    expect(css).toContain('translate(2px,-2px)')
    expect(css).toContain('--sp-test1234-bd:#0000000d')
  })

  it('escapes user text', () => {
    const config = mergeDeep(createDefaultConfig({ id: 'esc' }), { text: { bold: '<b>"x"</b>' } })
    const code = generateHtml(config)
    expect(code).not.toContain('<b>"x"</b>')
    expect(code).toContain('&lt;b&gt;&quot;x&quot;&lt;/b&gt;')
  })

  it('never opens mail links in a new tab', () => {
    expect(generateHtml(FIXTURES.adaptive)).not.toContain('target="_blank"')
  })

  it('derives initials and accessible text', () => {
    const config = mergeDeep(createDefaultConfig({ id: 'i' }), { text: { bold: 'olivier tousche dev', normal: 'Made by' } })
    expect(deriveInitials(config)).toBe('OT')
    expect(badgeText(config)).toBe('Made by olivier tousche dev')
    expect(badgeText(mergeDeep(config, { text: { order: 'bold-first' } }))).toBe('olivier tousche dev Made by')
  })

  it('drops the left padding asymmetry without avatar', () => {
    const { css } = generateBadge(FIXTURES.glass)
    expect(css).toContain('padding:0 10px 0 10px')
  })
})
