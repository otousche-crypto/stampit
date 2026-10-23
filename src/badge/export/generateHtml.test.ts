import { describe, expect, it } from 'vitest'
import { generateBadge, generateHtml, deriveInitials, badgeText, teamNames } from './generateHtml'
import { FIXTURES } from './fixtures'
import { createDefaultConfig, mergeDeep } from '../schema'

describe('generateHtml', () => {
  for (const [name, config] of Object.entries(FIXTURES)) {
    it(`snapshot: ${name}`, () => {
      expect(generateHtml(config, { editUrl: 'https://stampit.example/create#c=abc--def' })).toMatchSnapshot()
    })
  }

  it('names the team', () => {
    const team = (names: string[]) => teamNames(mergeDeep(createDefaultConfig(), { text: { bold: 'Ada Lovelace' }, team: names }))
    expect(team([])).toBe('Ada Lovelace')
    expect(team(['Grace Hopper'])).toBe('Ada & Grace')
    expect(team(['Grace Hopper', 'Alan Turing'])).toBe('Ada, Grace & Alan')
    expect(team(['Grace Hopper', 'Alan Turing', 'Linus Torvalds'])).toBe('Ada, Grace & 2 others')
  })


  it('names the stamp link, whose text is drawn in SVG', () => {
    expect(generateBadge(FIXTURES['layout-stamp']).html).toContain('aria-label="Crafted by Ada Lovelace, opens in a new tab"')
  })

  it('keeps the card social links outside the main link', () => {
    const { html } = generateBadge(FIXTURES['layout-card'])
    const link = html.slice(html.indexOf('<a class="sp-test1234__lk"'), html.indexOf('</a>'))
    expect(link).not.toContain('github.com')
    expect(html).toContain('Product designer')
  })

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
    // Adapt to site theme is on by default: one palette only when it is off.
    expect(link.css).toContain('@media (prefers-color-scheme:dark)')
    const oneTheme = mergeDeep(FIXTURES['link-initials'], { theme: { adaptToSite: false } })
    expect(generateBadge(oneTheme).css).not.toContain('prefers-color-scheme')
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

describe('animations', () => {
  it('emits nothing by default', () => {
    const { css } = generateBadge(FIXTURES['link-initials'])
    expect(css).not.toContain('@keyframes')
  })

  it('animates the wrapper on appear and the pill on hover', () => {
    const config = mergeDeep(FIXTURES['link-initials'], { motion: { entrance: 'bump', hover: 'shake' } })
    const { css } = generateBadge(config)
    expect(css).toContain('@keyframes sp-test1234-in{0%,100%{transform:none}35%{transform:scale(1.08)}65%{transform:scale(.97)}}')
    expect(css).toContain('.sp-test1234{animation:sp-test1234-in .48s var(--sp-test1234-attention) backwards}')
    expect(css).toContain('.sp-test1234__pill:hover{animation:sp-test1234-hv .48s var(--sp-test1234-attention)}')
    expect(css).toContain('animation:none;transform:none}')
  })

  it('sweeps a sheen across the pill for Shine', () => {
    const { css } = generateBadge(mergeDeep(FIXTURES['link-initials'], { motion: { entrance: 'shine' } }))
    expect(css).toContain('.sp-test1234__pill{position:relative;overflow:hidden}')
    expect(css).toContain('.sp-test1234__pill::after{content:""')
    expect(css).toContain('--sp-test1234-shine:cubic-bezier(')
  })

  it('reads retired appear values as none', async () => {
    const { parseConfig } = await import('../schema')
    const result = parseConfig({ ...FIXTURES['link-initials'], motion: { entrance: 'grow', hover: 'none' } })
    expect(result.ok && result.config.motion.entrance).toBe('none')
  })

  it('uses a transition for grow and lift', () => {
    const config = mergeDeep(FIXTURES['link-initials'], { motion: { hover: 'lift' } })
    const { css } = generateBadge(config)
    expect(css).toContain('transform .08s var(--sp-test1234-fast)')
    expect(css).toContain('.sp-test1234__pill:hover{transform:translateY(-2px)}')
  })
})

describe('icon styles', () => {
  it('draws the chosen icon and its hover nudge', () => {
    const tri = generateBadge(mergeDeep(FIXTURES['link-initials'], { shape: { iconStyle: 'triangle' } }))
    expect(tri.html).toContain('<path d="M9 7l6 5-6 5z" fill="currentColor"/>')
    expect(tri.css).toContain('{transform:translateX(2px)}')
    const link = generateBadge(mergeDeep(FIXTURES['link-initials'], { shape: { iconStyle: 'link' } }))
    expect(link.html).toContain('M10 13a5 5 0 0 0 7.5.5')
    const none = generateBadge(mergeDeep(FIXTURES['link-initials'], { shape: { showIcon: false } }))
    expect(none.html).not.toContain('<svg')
  })
})

describe('social links', () => {
  it('adds one round link per valid address, after the pill', () => {
    const { html, css } = generateBadge(FIXTURES['link-socials'])
    expect(html.match(/class="sp-test1234__so"/g)).toHaveLength(2)
    expect(html).toContain('aria-label="GitHub, opens in a new tab"')
    expect(html.indexOf('__so')).toBeGreaterThan(html.indexOf('__pill'))
    expect(css).toContain('.sp-test1234__so{')
  })

  it('emits no social CSS without socials', () => {
    expect(generateBadge(FIXTURES['link-initials']).css).not.toContain('__so')
  })
})

describe('on delay', () => {
  it('replays the effect every 5 s without disturbing the appear animation', () => {
    const { css } = generateBadge(mergeDeep(FIXTURES['link-initials'], { motion: { entrance: 'bump', repeat: 'shake' } }))
    expect(css).toContain('@keyframes sp-test1234-rp{0%,9.6%,100%{transform:none}1.9%,5.8%{transform:translateX(-3px)}3.8%,7.7%{transform:translateX(3px)}}')
    expect(css).toContain(
      '.sp-test1234{animation:sp-test1234-in .48s var(--sp-test1234-attention) backwards,sp-test1234-rp 5s var(--sp-test1234-repeat) 5s infinite}',
    )
  })

  it('stacks two sheens on the same pill', () => {
    const { css } = generateBadge(mergeDeep(FIXTURES['link-initials'], { motion: { entrance: 'shine', repeat: 'shine' } }))
    expect(css).toContain('@keyframes sp-test1234-rp{0%{transform:translateX(-110%)}18%,100%{transform:translateX(110%)}}')
    expect(css.match(/__pill::after\{content/g)).toHaveLength(1)
  })
})
