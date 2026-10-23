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

describe('toFramework', () => {
  for (const name of SAMPLES) {
    for (const language of CODE_LANGUAGES) {
      it(`snapshot: ${name} → ${language}`, () => {
        expect(toFramework(generateBadge(FIXTURES[name], { editUrl: 'https://stampit.example/create#c=abc' }), language)).toMatchSnapshot()
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

  it('HTML is the snippet itself', () => {
    const badge = generateBadge(FIXTURES['link-initials'])
    expect(toFramework(badge, 'html')).toBe(badge.code)
  })
})
