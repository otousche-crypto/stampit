import { describe, expect, it } from 'vitest'
import { generateBadge, generateHtml, deriveInitials, badgeText, githubUser, teamNames } from './generateHtml'
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
    expect(link.css).not.toContain('__dlg')
    expect(link.js).toBeNull()
    expect(generateBadge(FIXTURES.glass).css).toContain('backdrop-filter:blur(')
    expect(generateBadge(FIXTURES.adaptive).css).toContain('@media (prefers-color-scheme:dark)')
  })

  it('emits the profile modal only in Profile mode', () => {
    const p = generateBadge(FIXTURES['profile-full'])
    expect(p.js).not.toBeNull()
    expect(p.html).toContain('<button type="button" class="sp-test1234__pill" aria-haspopup="dialog" aria-controls="sp-test1234-dlg"')
    expect(p.html).toContain('aria-label="Launched by Olivier Tousche, open profile"')
    expect(p.html).toContain('<dialog id="sp-test1234-dlg" class="sp-test1234__dlg" aria-labelledby="sp-test1234-dlg-t">')
    expect(p.html).toContain('<form method="dialog" class="sp-test1234__xf">')
    expect(p.html).toContain('aria-label="Portfolio, opens in a new tab"')
    expect(p.html).toContain('aria-label="LinkedIn, opens in a new tab"')
    expect(p.html).toContain('data-user="olivier"')
    // GitHub: only the bricks, as one link to the profile.
    expect(p.html).toContain('aria-label="GitHub contributions of @olivier, opens in a new tab"')
    expect(p.css).toContain('@media (max-width:480px){.sp-test1234__dlg:modal{')
    // Projects are links: named, with a valid address.
    expect(p.html).toContain('href="https://stampit.app"')
    expect(p.html).not.toContain('Décadi')
    expect(p.html).not.toContain('ignored.example')
    expect(p.html).toContain('aria-label="Made with Stampit, opens in a new tab">Made with <span>Stampit</span></a>')
    // Newsletter (Substack: Subscribe opens the page) and Donate, switched on.
    expect(p.html).toContain('action="https://olivier.substack.com" method="get" target="_blank" aria-label="Newsletter"><input type="email" name="email"')
    expect(p.html).toContain('Buy me a coffee</a>')
    // The newsletter sits right after the GitHub graph, before the projects.
    expect(p.html.indexOf('__gh"')).toBeLessThan(p.html.indexOf('__nl"'))
    expect(p.html.indexOf('__nl"')).toBeLessThan(p.html.indexOf('-pj-t'))
    // The social links live in the modal, not beside the badge.
    expect(p.html).not.toContain('__sos')
    expect(p.css).toContain('@starting-style')
    expect(p.css).toContain('--sp-test1234-on:#fff')

    const minimal = generateBadge(FIXTURES['profile-minimal'])
    expect(minimal.html).not.toContain('__gh')
    expect(minimal.html).not.toContain('__mj')
    // Only "Made with Stampit" leaves in a new tab when the profile's links don't.
    expect(minimal.html.match(/target="_blank"/g)).toHaveLength(1)
    // No avatar on the badge, initials in the modal.
    expect(minimal.html).toContain('<span class="sp-test1234__mav" aria-hidden="true">EL</span>')
  })

  it('shows only the sections that are on', () => {
    const off = mergeDeep(FIXTURES['profile-full'], {
      click: { profile: { sections: { github: false, projects: false, newsletter: false, donate: false } } },
    })
    const html = generateBadge(off).html
    for (const part of ['__gh', '__mj', 'substack', 'ko-fi']) expect(html).not.toContain(part)
    // The links stay.
    expect(html).toContain('aria-label="LinkedIn, opens in a new tab"')
  })

  it('posts to Buttondown, Kit and Mailchimp, and opens the page for the others', () => {
    const direct = mergeDeep(FIXTURES['profile-full'], { click: { profile: { newsletter: { url: 'https://buttondown.com/olivier' } } } })
    const html = generateBadge(direct).html
    expect(html).toContain('<form class="sp-test1234__nf" action="https://buttondown.com/api/emails/embed-subscribe/olivier" method="post" target="_blank" aria-label="Newsletter"><input type="email" name="email" required')
    expect(html).toContain('<button type="submit">Subscribe</button>')
    // Substack (the fixture): the same field, which opens the page.
    expect(generateBadge(FIXTURES['profile-full']).html).toContain('method="get"')
  })

  it('previews Newsletter and Donate as soon as they are on, before their links are set', () => {
    const on = mergeDeep(FIXTURES['profile-minimal'], { click: { profile: { sections: { newsletter: true, donate: true } } } })
    const html = generateBadge(on).html
    expect(html).toContain('<button type="submit">Subscribe</button>')
    expect(html).toContain('Support my work</a>')
  })

  it('reads the GitHub user from profile links only', () => {
    const at = (github: string) => githubUser(mergeDeep(FIXTURES['profile-minimal'], { socials: { github } }))
    expect(at('https://github.com/ada-l')).toBe('ada-l')
    expect(at('https://www.github.com/ada/repo')).toBe('ada')
    expect(at('https://gitlab.com/ada')).toBeNull()
    expect(at('https://github.com/')).toBeNull()
    expect(at('')).toBeNull()
  })

  it('reproduces the Décadi badge in Light / M', () => {
    // The Décadi badge has a 1px border and the soft shadow (no longer the defaults).
    const decadi = mergeDeep(FIXTURES['link-initials'], { shape: { borderWidth: 1, shadow: 'soft' } })
    const { css } = generateBadge(decadi)
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
    const { css } = generateBadge(FIXTURES['profile-full'])
    const media = css.slice(css.indexOf('@media (prefers-reduced-motion:reduce)'))
    expect(media).toContain('.sp-test1234 .sp-test1234__dlg,.sp-test1234 .sp-test1234__dlg[open]{transform:none}')
    const link = generateBadge(FIXTURES['link-initials']).css
    expect(link).toContain('.sp-test1234 .sp-test1234__pill:hover .sp-test1234__ic,.sp-test1234 .sp-test1234__pill:focus-visible .sp-test1234__ic{transform:none}')
  })
})

describe('animations', () => {
  it('emits nothing when every animation is off', () => {
    const still = mergeDeep(FIXTURES['link-initials'], { motion: { entrance: 'none', repeat: 'none', hover: 'none' } })
    expect(generateBadge(still).css).not.toContain('@keyframes')
  })

  it('shakes on appear, shines every few seconds and grows on hover by default', () => {
    const { css } = generateBadge(FIXTURES['link-initials'])
    expect(css).toContain('@keyframes sp-test1234-in')
    expect(css).toContain('@keyframes sp-test1234-rp')
    expect(css).toContain('.sp-test1234__pill:hover{transform:scale(1.04)}')
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
