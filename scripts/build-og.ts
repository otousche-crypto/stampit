/**
 * Open Graph image (1200×630): the demo badge, large, on Décadi's panel grey.
 * Run once with `npm run build:og`; the PNG is committed in public/.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const avatar = readFileSync(root + 'public/olivier-avatar.png').toString('base64')

// Badge M at 3×: height 108, avatar 84, padding 12 / 36, gap 24, text 45. Width fits
// the server-side fallback font (wider than SF Pro).
const s = 3
const h = 36 * s
const w = 246 * s
const x = (1200 - w) / 2
const y = 360
const font = `-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="av"><circle cx="${x + 4 * s + 14 * s}" cy="${y + h / 2}" r="${14 * s}"/></clipPath>
    <filter id="sh" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="${2 * s}" stdDeviation="${4 * s}" flood-color="#000" flood-opacity="0.10"/></filter>
  </defs>
  <rect width="1200" height="630" fill="#F2F2F7"/>
  <text x="600" y="190" text-anchor="middle" font-family="${font}" font-size="64" font-weight="700" fill="#000">Stamp everything you ship.</text>
  <text x="600" y="250" text-anchor="middle" font-family="${font}" font-size="30" fill="#6E6E73">Make your own badge · Stampit</text>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#FFF" filter="url(#sh)"/>
  <rect x="${x + 0.5 * s}" y="${y + 0.5 * s}" width="${w - s}" height="${h - s}" rx="${h / 2 - 0.5 * s}" fill="none" stroke="#000" stroke-opacity="0.05" stroke-width="${s}"/>
  <circle cx="${x + 18 * s}" cy="${y + h / 2}" r="${14 * s}" fill="#FF6B35"/>
  <image x="${x + 4 * s}" y="${y + 4 * s}" width="${28 * s}" height="${28 * s}" clip-path="url(#av)" xlink:href="data:image/png;base64,${avatar}"/>
  <text x="${x + 40 * s}" y="${y + h / 2 + 5.4 * s}" font-family="${font}" font-size="${15 * s}" xml:space="preserve"><tspan fill="#6E6E73">Made by </tspan><tspan fill="#000" font-weight="500">Olivier Tousche</tspan></text>
  <g transform="translate(${x + w - 12 * s - 14 * s} ${y + h / 2 - 7 * s}) scale(${(14 * s) / 24})" fill="none" stroke="#6E6E73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </g>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(root + 'public/og.png')
console.log('public/og.png written')
