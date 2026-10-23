import { describe, expect, it } from 'vitest'
import { transformSync } from 'esbuild'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { generateBadge } from './generateHtml'
import { CODE_LANGUAGES, toFramework, toJsx } from './frameworks'
import { FIXTURES } from './fixtures'

const SAMPLES = ['link-socials', 'bubbles-2', 'layout-stamp', 'layout-card'] as const

/** Compiles the React output and renders it, as a project would. */
function renderReact(source: string): string {
  // TypeScript 7 has no JS API: esbuild (Vite's) compiles the TSX.
  const js = transformSync(source, { loader: 'tsx', format: 'cjs', jsx: 'transform' }).code
  const module = { exports: {} as Record<string, unknown> }
  new Function('require', 'module', 'exports', 'React', js)(
    (name: string) => (name === 'react' ? React : null),
    module,
    module.exports,
    React,
  )
  return renderToStaticMarkup(React.createElement(module.exports.StampitBadge as React.FC))
}

/** Attribute-order-insensitive view of markup: the sorted list of tags with their attributes. */
const tags = (markup: string) =>
  [...markup.replace(/<style>[\s\S]*?<\/style>/, '').matchAll(/<([a-z]+)([^>]*?)\/?>/g)]
    .map(([, tag, attrs]) => `${tag} ${[...attrs.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map(([, n, v]) => `${n.toLowerCase()}=${v}`).sort().join(' ')}`)
    .sort()

/** The `_spec` constant of a generated Flutter file. */
const flutterSpec = (code: string) => code.slice(code.indexOf('const _spec'), code.indexOf('\n);', code.indexOf('const _spec')) + 3)

describe('toFramework', () => {
  for (const name of SAMPLES) {
    for (const language of CODE_LANGUAGES) {
      it(`snapshot: ${name} → ${language}`, () => {
        const code = toFramework(generateBadge(FIXTURES[name], { editUrl: 'https://stampit.example/create#c=abc' }), language)
        // Flutter: the widget code is a fixed template; only the settings change.
        expect(language === 'flutter' ? flutterSpec(code) : code).toMatchSnapshot()
      })
    }

    it(`React renders the same markup as the HTML snippet: ${name}`, () => {
      const badge = generateBadge(FIXTURES[name])
      // React 19 hoists an image preload ahead of the markup: not part of the badge.
      const rendered = renderReact(toFramework(badge, 'react')).replace(/^(<link rel="preload"[^>]*>)+/, '')
      expect(rendered.startsWith('<style>')).toBe(true)
      expect(tags(rendered)).toEqual(tags(badge.html))
    })
  }

  it('escapes braces in the user text for JSX', () => {
    expect(toJsx('<span>a {b}</span>')).toBe('<span>a &#123;b&#125;</span>')
  })

  it('Flutter: the template with the settings filled in', () => {
    const code = toFramework(generateBadge(FIXTURES['link-initials'], { editUrl: 'https://stampit.example/create#c=abc' }), 'flutter')
    expect(code).not.toContain('STAMPIT:')
    expect(code.startsWith('// Stampit badge · edit: https://stampit.example/create#c=abc')).toBe(true)
    expect(code.match(/const _spec = /g)).toHaveLength(1)
  })

  it('Flutter: Dart strings are escaped', () => {
    const config = { ...FIXTURES['link-initials'], text: { ...FIXTURES['link-initials'].text, bold: "O'Neil $5 \\" } }
    expect(flutterSpec(toFramework(generateBadge(config), 'flutter'))).toContain("bold: 'O\\'Neil \\$5 \\\\',")
  })

  it('HTML is the snippet itself', () => {
    const badge = generateBadge(FIXTURES['link-initials'])
    expect(toFramework(badge, 'html')).toBe(badge.code)
  })
})
