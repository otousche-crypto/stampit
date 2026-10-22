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

  it('emits the bubble menu only in Bubbles mode', () => {
    const b = generateBadge(FIXTURES['bubbles-2'])
    expect(b.js).not.toBeNull()
    expect(b.html).toContain('popover="auto"')
    expect(b.html).toContain('popovertarget="sp-test1234-menu"')
    expect(b.html).toContain('aria-label="Launched by Olivier Tousche, show links"')
    expect(b.html).toContain('aria-label="LinkedIn, opens in a new tab"')
    expect(b.css).toContain(':popover-open')
    expect(b.css).toContain('--sp-test1234-slow:linear(')
    const eight = generateBadge(FIXTURES['bubbles-8'])
    expect(eight.html.match(/<li>/g)).toHaveLength(8)
    expect(eight.html).toContain('aria-label="Email Eight Links"')
    expect(eight.html).not.toContain('target="_blank"')
    // Only the icons of channels in use.
    expect(generateBadge(FIXTURES['bubbles-2']).html.match(/<path /g)).toHaveLength(2)
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

describe('reduced motion', () => {
  it('cancels every movement with selectors that win', () => {
    const { css } = generateBadge(FIXTURES['bubbles-2'])
    const media = css.slice(css.indexOf('@media (prefers-reduced-motion:reduce)'))
    expect(media).toContain('.sp-test1234[data-js] .sp-test1234__menu[data-open] li{transform:none;transition-property:opacity;transition-delay:0s}')
    expect(media).toContain('.sp-test1234__bub:hover{transform:none')
    const link = generateBadge(FIXTURES['link-initials']).css
    expect(link).toContain('.sp-test1234 .sp-test1234__pill:hover .sp-test1234__ic,.sp-test1234 .sp-test1234__pill:focus-visible .sp-test1234__ic{transform:none}')
  })
})
