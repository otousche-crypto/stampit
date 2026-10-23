import { CHANNELS, channelLabel } from '../channels'
import type { BadgeConfig, Palette } from '../schema'
import {
  STAMP_SIZES,
  SIZES,
  TEAM_COLORS,
  activeSocials,
  badgeText,
  deriveInitials,
  initialsColor,
  initialsOf,
  resolveAvatar,
  sheenColor,
  stampFontSize,
  teamMembers,
  teamNames,
  usesBubbles,
  type GenerateHtmlOptions,
} from './generateHtml'
import TEMPLATE from './flutter/stampit_badge.dart?raw'

/** The link icons as path data on the 24 grid (the HTML draws them with SVG shapes). */
const ICON_PATHS: Record<BadgeConfig['shape']['iconStyle'] | 'plus', { d: string; filled?: boolean }> = {
  arrow: { d: 'M7 17L17 7M7 7h10v10' },
  triangle: { d: 'M9 7l6 5-6 5z', filled: true },
  link: { d: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7' },
  plus: { d: 'M12 5v14M5 12h14' },
}

/** A Dart single-quoted string. */
const str = (value: string) =>
  `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$').replace(/\n/g, '\\n')}'`

/** "#RRGGBB(AA)" → Color(0xAARRGGBB). */
function color(hex: string): string {
  const h = hex.replace('#', '').toUpperCase()
  return `Color(0x${h.length === 8 ? h.slice(6) : 'FF'}${h.slice(0, 6)})`
}

/** "rgba(r,g,b,a)" (the Shine colour) → Color. */
function rgbaColor(rgba: string): string {
  const [r, g, b, a] = rgba.match(/[\d.]+/g)!.map(Number)
  const to2 = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase()
  return `Color(0x${to2(a * 255)}${to2(r)}${to2(g)}${to2(b)})`
}

const num = (n: number) => String(Math.round(n * 100) / 100)

const icon = ({ d, filled }: { d: string; filled?: boolean }) => `_Icon(${str(d)}${filled ? ', filled: true' : ''})`

function palette(p: Palette, config: BadgeConfig): string {
  return [
    '_Palette(',
    `  background: ${color(p.background)},`,
    `  border: ${color(p.border)},`,
    `  textNormal: ${color(p.textNormal)},`,
    `  textBold: ${color(p.textBold)},`,
    `  icon: ${color(p.icon)},`,
    `  blur: ${p.blur},`,
    `  sheen: ${rgbaColor(sheenColor(p))},`,
    `  initials: ${color(initialsColor(config, p))},`,
    ')',
  ].join('\n  ')
}

/** The `_spec` constant: every setting, resolved to plain values. */
function spec(config: BadgeConfig, options: GenerateHtmlOptions): string {
  const size = SIZES[config.text.size]
  const layout = config.layout
  const avatar = resolveAvatar(config, options)
  const hasAvatar = avatar.kind !== 'none'
  const { palettes, adaptToSite, base } = config.theme
  const light = adaptToSite ? palettes.light : palettes[base]
  const dark = adaptToSite ? palettes.dark : palettes[base]
  const radius = layout === 'card' ? Math.round(8 + config.shape.radius * 12) : (config.shape.radius * size.height) / 2
  const inner = Math.max(0, radius - size.padLeft)
  const avatarRadius = inner >= size.avatar / 2 ? size.avatar / 2 : inner
  const bubbles = usesBubbles(config)
  const bold = layout === 'team' ? teamNames(config) : config.text.bold.trim()
  const newTab = config.click.link.newTab

  const lines: string[] = [
    `layout: _Layout.${layout},`,
    `label: ${str(badgeText(config))},`,
    `normal: ${str(config.text.normal.trim())},`,
    `bold: ${str(bold)},`,
  ]
  if (layout === 'card' && config.text.role.trim()) lines.push(`role: ${str(config.text.role.trim())},`)
  lines.push(
    `boldFirst: ${config.text.order === 'bold-first'},`,
    `boldWeight: FontWeight.w${config.text.boldWeight},`,
    `font: _Font.${config.text.font},`,
    `height: ${size.height},`,
    `textSize: ${size.text},`,
    `avatarSize: ${size.avatar},`,
    `padLeft: ${hasAvatar ? size.padLeft : size.padRight},`,
    `padRight: ${size.padRight},`,
    `gap: ${size.gap},`,
    `iconSize: ${size.icon},`,
    `bubbleSize: ${size.bubble},`,
    `radius: ${num(radius)},`,
    `avatarRadius: ${num(avatarRadius)},`,
  )
  if (avatar.kind === 'initials') lines.push(`initials: ${str(avatar.initials)},`)
  if (avatar.kind === 'image') lines.push(`initials: ${str(deriveInitials(config))},`, `image: ${str(avatar.src)},`)
  lines.push(`avatarBackground: ${color(config.avatar.background)},`)
  if (layout === 'team') {
    const members = teamMembers(config)
      .slice(0, 2)
      .map((name, i) => `_Member(${str(initialsOf(name))}, ${color(TEAM_COLORS[i])})`)
    if (members.length) lines.push(`team: [${members.join(', ')}],`)
  }
  lines.push(`adapt: ${adaptToSite},`, `light: ${palette(light, config)},`, `dark: ${palette(dark, config)},`)
  if (config.shape.borderWidth) lines.push(`borderWidth: ${config.shape.borderWidth},`)
  lines.push(`softShadow: ${config.shape.shadow === 'soft'},`)
  if (config.shape.showIcon && layout !== 'stamp') {
    lines.push(`icon: ${icon(ICON_PATHS[bubbles ? 'plus' : config.shape.iconStyle])},`)
    if (!bubbles) lines.push(`iconHover: _IconHover.${config.shape.iconStyle},`)
  }
  const { entrance, repeat, hover } = config.motion
  if (entrance !== 'none') lines.push(`entrance: _Effect.${entrance},`)
  if (repeat !== 'none') lines.push(`repeat: _Effect.${repeat},`)
  if (hover !== 'none') lines.push(`hover: _Hover.${hover},`)

  if (bubbles) {
    const channels = config.click.bubbles.channels.map((ch) => {
      const name = channelLabel(ch)
      const isMail = ch.type === 'email' || ch.url.startsWith('mailto:')
      const blank = newTab && !isMail
      const aria = isMail ? `Email${bold ? ` ${bold}` : ''}` : blank ? `${name}, opens in a new tab` : name
      const ic = CHANNELS[ch.type].icon
      return `_Link(${str(name)}, ${str(ch.url)}, ${icon({ d: ic.d, filled: ic.kind === 'fill' })}, newTab: ${blank}, semantics: ${str(aria)}),`
    })
    lines.push('bubbles: [', ...channels.map((c) => `  ${c}`), '],')
    if (config.click.bubbles.labels === 'icon-label') lines.push('bubbleLabels: true,')
  } else {
    const { url } = config.click.link
    lines.push(`url: ${str(url)},`, `newTab: ${newTab && !url.startsWith('mailto:')},`)
  }

  const socials = activeSocials(config).map(({ network, url }) => {
    const ic = CHANNELS[network].icon
    return `_Link(${str(CHANNELS[network].label)}, ${str(url)}, ${icon({ d: ic.d, filled: ic.kind === 'fill' })}, newTab: ${newTab}),`
  })
  if (socials.length) lines.push('socials: [', ...socials.map((s) => `  ${s}`), '],')

  if (layout === 'stamp') {
    const normal = config.text.normal.trim().toUpperCase()
    const b = config.text.bold.trim().toUpperCase()
    const parts: string[] = []
    const n = normal ? `_RingPart(${str(normal)})` : ''
    const bb = b ? `_RingPart(${str(b)}, bold: true)` : ''
    const ordered = (config.text.order === 'normal-first' ? [n, bb] : [bb, n]).filter(Boolean)
    ordered.forEach((p, i) => {
      if (i > 0) parts.push(`_RingPart(' ')`)
      parts.push(p)
    })
    parts.push(`_RingPart('\\u00A0•\\u00A0')`)
    lines.push(`stampSize: ${STAMP_SIZES[config.text.size]},`, `ring: [${parts.join(', ')}],`, `ringFontSize: ${stampFontSize(config)},`)
  }

  return `const _spec = _Spec(\n${lines.map((l) => `  ${l}`).join('\n')}\n);`
}

/** A native Flutter widget: the template with this badge's settings. */
export function generateFlutter(config: BadgeConfig, options: GenerateHtmlOptions, header: string): string {
  const start = TEMPLATE.indexOf('// STAMPIT:SPEC:START')
  const end = TEMPLATE.indexOf('// STAMPIT:SPEC:END') + '// STAMPIT:SPEC:END'.length
  return (TEMPLATE.slice(0, start) + spec(config, options) + TEMPLATE.slice(end)).replace('// STAMPIT:HEADER', `// ${header}`)
}
