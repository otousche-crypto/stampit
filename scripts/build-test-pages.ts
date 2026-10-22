/**
 * Manual QA pages (§13): the exported snippet in an empty page, twice on the
 * same page, under aggressive host CSS, and at the top of the screen.
 * Served by the dev server at /test-pages/*.html; never part of the build.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { FIXTURES } from '../src/badge/export/fixtures'
import { DEMO_CONFIG } from '../src/badge/demo'
import { generateHtml } from '../src/badge/export/generateHtml'
import { mergeDeep } from '../src/badge/schema'

const dir = fileURLToPath(new URL('../test-pages/', import.meta.url))
mkdirSync(dir, { recursive: true })

const page = (title: string, body: string, head = '') =>
  `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${head}</head>\n<body>\n${body}\n</body></html>\n`

const bubbles = mergeDeep(FIXTURES['bubbles-2'], { id: 'qa2' })
const eight = mergeDeep(FIXTURES['bubbles-8'], { id: 'qa8' })

writeFileSync(
  dir + 'empty.html',
  page(
    'Empty page',
    `<footer style="position:fixed;bottom:24px;left:0;right:0;text-align:center">\n${generateHtml(bubbles)}</footer>`,
  ),
)

writeFileSync(
  dir + 'twice.html',
  page(
    'Same snippet twice',
    `<div style="margin:200px 0 0;text-align:center">${generateHtml(bubbles)}</div>\n<div style="text-align:center;margin-top:120px">${generateHtml(bubbles)}</div>\n<div style="text-align:center;margin-top:120px">${generateHtml(DEMO_CONFIG)}</div>`,
  ),
)

writeFileSync(
  dir + 'aggressive.html',
  page(
    'Aggressive host CSS',
    `<div class="clip"><div class="moved">\n${generateHtml(eight)}\n</div></div>`,
    `<style>*{margin:20px;padding:0;box-sizing:content-box;font:italic 30px/3 Georgia;color:red;letter-spacing:4px;text-transform:uppercase}a{text-decoration:underline wavy}ul,li{list-style:square}svg{width:60px}button{border:3px solid lime;background:yellow}.clip{overflow:hidden;height:180px;margin-top:400px!important;transform:translateZ(0)}.moved{transform:rotate(2deg) scale(.9)}</style>`,
  ),
)

writeFileSync(
  dir + 'top.html',
  page('Badge at the top', `<header style="padding:8px">${generateHtml(eight)}</header>`),
)
console.log('test pages written to test-pages/')
