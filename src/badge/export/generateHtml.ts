import { bestOn, contrastRatio } from '../contrast'
import type { BadgeConfig, BadgeSize, Palette } from '../schema'
import { CSS_SPRINGS, type CssSpringName } from '../springs-css'

/** §7.1 — badge metrics per size, in px. */
export const SIZES: Record<
  BadgeSize,
  { height: number; text: number; avatar: number; padLeft: number; padRight: number; gap: number; icon: number; bubble: number }
> = {
  s: { height: 30, text: 13, avatar: 22, padLeft: 4, padRight: 10, gap: 6, icon: 12, bubble: 36 },
  m: { height: 36, text: 15, avatar: 28, padLeft: 4, padRight: 12, gap: 8, icon: 14, bubble: 40 },
  l: { height: 44, text: 17, avatar: 36, padLeft: 4, padRight: 14, gap: 10, icon: 16, bubble: 44 },
}

export const FONT_STACKS: Record<BadgeConfig['text']['font'], string> = {
  sans: '-apple-system,system-ui,"SF Pro Text","Helvetica Neue","Segoe UI",Roboto,sans-serif',
  serif: 'ui-serif,Georgia,"Times New Roman",serif',
  mono: 'ui-monospace,"SF Mono",Menlo,Consolas,monospace',
}

export const SOFT_SHADOW = '0 1px 6px rgba(0,0,0,.08)'
export const SOFT_SHADOW_HOVER = '0 2px 12px rgba(0,0,0,.12)'

export type GenerateHtmlOptions = {
  /** Link back to the editor, written in the header comment. */
  editUrl?: string
  /** Data URL of the uploaded photo (`avatar.source = "upload"`). */
  uploadDataUrl?: string | null
  /** Replace the uploaded photo by this path (used by the prompt). */
  uploadPath?: string
  /** The editor saw the avatar image fail: render initials instead. */
  avatarFailed?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** `--` would end the HTML comment early. */
function commentSafe(value: string): string {
  return value.replace(/--/g, '-%2D').replace(/>/g, '%3E')
}

/** Lower-case hex, short alpha dropped when opaque — smaller CSS. */
function css(hex: string): string {
  const h = hex.toLowerCase()
  return h.length === 9 && h.endsWith('ff') ? h.slice(0, 7) : h
}

/** Initials from the first two words of the bold text (or the normal text). */
export function deriveInitials(config: BadgeConfig): string {
  const custom = config.avatar.initials?.trim()
  if (custom) return custom.slice(0, 2).toUpperCase()
  const source = config.text.bold.trim() || config.text.normal.trim()
  const words = source.split(/\s+/).filter(Boolean)
  const letters = words
    .slice(0, 2)
    .map((w) => Array.from(w)[0] ?? '')
    .join('')
  return (letters || '?').toUpperCase()
}

/** Initials take `textBold` when it reads on the avatar, otherwise white or black. */
export function initialsColor(config: BadgeConfig, palette: Palette): string {
  const bg = config.avatar.background
  const bold = palette.textBold.slice(0, 7)
  return contrastRatio(bold, bg) >= 4.5 ? bold : bestOn(bg)
}

/** Accessible text of the badge, normal and bold in display order. */
export function badgeText(config: BadgeConfig): string {
  const { normal, bold, order } = config.text
  const parts = order === 'normal-first' ? [normal, bold] : [bold, normal]
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
}

export type ResolvedAvatar =
  | { kind: 'none' }
  | { kind: 'initials'; initials: string }
  | { kind: 'image'; src: string }

export function resolveAvatar(config: BadgeConfig, options: GenerateHtmlOptions = {}): ResolvedAvatar {
  const { source, url } = config.avatar
  if (source === 'none') return { kind: 'none' }
  const initials = { kind: 'initials' as const, initials: deriveInitials(config) }
  if (source === 'initials' || options.avatarFailed) return initials
  if (source === 'url') return url ? { kind: 'image', src: url } : initials
  // upload
  if (options.uploadPath) return { kind: 'image', src: options.uploadPath }
  if (options.uploadDataUrl) return { kind: 'image', src: options.uploadDataUrl }
  return initials
}

export const ARROW_ICON =
  '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>'
export const PLUS_ICON = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'

function strokeSvg(cls: string, size: number, body: string): string {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

function paletteVars(p: Palette, prefix: string): string {
  return [
    `${prefix}bg:${css(p.background)}`,
    `${prefix}bd:${css(p.border)}`,
    `${prefix}tn:${css(p.textNormal)}`,
    `${prefix}tb:${css(p.textBold)}`,
    `${prefix}ic:${css(p.icon)}`,
  ].join(';')
}

type CssContext = {
  c: string // class prefix, e.g. "sp-abc123"
  v: string // custom property prefix, e.g. "--sp-abc123-"
  config: BadgeConfig
  springs: Set<CssSpringName>
}

function springVar(ctx: CssContext, name: CssSpringName): string {
  ctx.springs.add(name)
  return `var(${ctx.v}${CSS_SPRINGS[name].name})`
}

function transition(ctx: CssContext, property: string, name: CssSpringName, delay = ''): string {
  return `${property} ${CSS_SPRINGS[name].duration} ${springVar(ctx, name)}${delay ? ` ${delay}` : ''}`
}

function buildCss(config: BadgeConfig, avatar: ResolvedAvatar): string {
  const id = config.id
  const ctx: CssContext = { c: `sp-${id}`, v: `--sp-${id}-`, config, springs: new Set() }
  const { c, v } = ctx
  const size = SIZES[config.text.size]
  const { palettes, adaptToSite, base } = config.theme
  const lightOrBase = adaptToSite ? palettes.light : palettes[base]
  const radius = Math.round(((config.shape.radius * size.height) / 2) * 100) / 100
  const hasAvatar = avatar.kind !== 'none'
  const padLeft = hasAvatar ? size.padLeft : size.padRight
  const border = config.shape.borderWidth
  const soft = config.shape.shadow === 'soft'
  const showIcon = config.shape.showIcon
  const anyBlur = adaptToSite ? palettes.light.blur > 0 || palettes.dark.blur > 0 : lightOrBase.blur > 0

  const ring = border > 0 ? `inset 0 0 0 ${border}px var(${v}bd)` : ''
  const shadow = (s: string) => [ring, soft ? s : ''].filter(Boolean).join(',') || 'none'

  const rules: string[] = []
  // Reset: the badge must survive aggressive host CSS.
  rules.push(
    `.${c},.${c} *,.${c} *::before,.${c} *::after{box-sizing:border-box;margin:0;padding:0;border:0;font:inherit;line-height:inherit;letter-spacing:normal;text-transform:none;text-decoration:none;list-style:none;background:none;color:inherit;max-width:none;min-width:0;float:none}`,
  )
  const vars = [paletteVars(lightOrBase, v)]
  if (anyBlur) vars.push(`${v}blur:${lightOrBase.blur}px`)
  rules.push(
    `.${c}{${vars.join(';')};display:inline-block;position:relative;vertical-align:middle;font-family:${FONT_STACKS[config.text.font]};font-size:${size.text}px;font-weight:400;line-height:1.2;text-align:left;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`,
  )

  const pill = [
    'display:inline-flex',
    'align-items:center',
    `gap:${size.gap}px`,
    `height:${size.height}px`,
    `padding:0 ${size.padRight}px 0 ${padLeft}px`,
    `border-radius:${radius}px`,
    `background:var(${v}bg)`,
    `box-shadow:${shadow(SOFT_SHADOW)}`,
    `color:var(${v}tb)`,
    'white-space:nowrap',
    'cursor:pointer',
    'user-select:none',
    '-webkit-tap-highlight-color:transparent',
    'outline:none',
  ]
  if (anyBlur) pill.push(`-webkit-backdrop-filter:blur(var(${v}blur))`, `backdrop-filter:blur(var(${v}blur))`)
  if (soft) pill.push(`transition:${transition(ctx, 'box-shadow', 'fast')}`)
  rules.push(`.${c}__pill{${pill.join(';')}}`)
  if (soft) rules.push(`.${c}__pill:hover{box-shadow:${shadow(SOFT_SHADOW_HOVER)}}`)
  rules.push(`.${c}__pill:focus-visible{outline:2px solid var(${v}tb);outline-offset:2px}`)

  if (hasAvatar) {
    // Concentric with the pill corner; a full capsule gives a round avatar.
    const inner = Math.max(0, radius - size.padLeft)
    const avatarRadius = inner >= size.avatar / 2 ? '50%' : `${inner}px`
    const a = [
      'flex:none',
      'display:grid',
      'place-items:center',
      `width:${size.avatar}px`,
      `height:${size.avatar}px`,
      `border-radius:${avatarRadius}`,
      'overflow:hidden',
      `background:${css(config.avatar.background)}`,
    ]
    if (avatar.kind === 'initials') {
      a.push(
        `color:${css(initialsColor(config, lightOrBase))}`,
        `font-size:${Math.round(size.avatar * 0.4)}px`,
        'font-weight:600',
        'line-height:1',
      )
    }
    rules.push(`.${c}__av{${a.join(';')}}`)
    if (avatar.kind === 'image') {
      rules.push(`.${c}__av img{display:block;width:100%;height:100%;object-fit:cover}`)
    }
  }

  rules.push(`.${c}__n{color:var(${v}tn)}`)
  rules.push(`.${c}__b{color:var(${v}tb);font-weight:${config.text.boldWeight}}`)

  if (showIcon) {
    rules.push(`.${c}__ic{flex:none;display:block;color:var(${v}ic);transition:${transition(ctx, 'transform', 'fast')}}`)
    rules.push(`.${c}__pill:hover .${c}__ic,.${c}__pill:focus-visible .${c}__ic{transform:translate(2px,-2px)}`)
  }

  if (adaptToSite) {
    const dark = palettes.dark
    const darkVars = [paletteVars(dark, v)]
    if (anyBlur) darkVars.push(`${v}blur:${dark.blur}px`)
    let darkRules = `.${c}{${darkVars.join(';')}}`
    if (hasAvatar && avatar.kind === 'initials') {
      const lightInitials = initialsColor(config, palettes.light)
      const darkInitials = initialsColor(config, dark)
      if (lightInitials !== darkInitials) darkRules += `.${c}__av{color:${css(darkInitials)}}`
    }
    rules.push(`@media (prefers-color-scheme:dark){${darkRules}}`)
  }

  rules.push(`@media (prefers-reduced-motion:reduce){.${c}__ic{transition:none}.${c} .${c}__ic{transform:none}}`)

  // Custom properties for the springs actually used, declared once.
  if (ctx.springs.size > 0) {
    const decl = [...ctx.springs].map((n) => `${v}${CSS_SPRINGS[n].name}:${CSS_SPRINGS[n].easing}`).join(';')
    rules.unshift(`.${c}{${decl}}`)
  }
  return rules.join('')
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

function avatarHtml(c: string, avatar: ResolvedAvatar, size: number): string {
  if (avatar.kind === 'none') return ''
  if (avatar.kind === 'initials') {
    return `<span class="${c}__av" aria-hidden="true">${escapeHtml(avatar.initials)}</span>`
  }
  return `<span class="${c}__av" aria-hidden="true"><img src="${escapeHtml(avatar.src)}" alt="" width="${size}" height="${size}" decoding="async"></span>`
}

function textHtml(c: string, config: BadgeConfig): string {
  const normal = config.text.normal.trim()
  const bold = config.text.bold.trim()
  const n = normal ? `<span class="${c}__n">${escapeHtml(normal)}</span>` : ''
  const b = bold ? `<span class="${c}__b">${escapeHtml(bold)}</span>` : ''
  const parts = (config.text.order === 'normal-first' ? [n, b] : [b, n]).filter(Boolean)
  return `<span>${parts.join(' ')}</span>`
}

export type GeneratedBadge = { html: string; css: string; js: string | null; code: string }

/** Pure: config → standalone HTML/CSS(/JS) snippet. What the preview shows is what gets copied. */
export function generateBadge(config: BadgeConfig, options: GenerateHtmlOptions = {}): GeneratedBadge {
  const c = `sp-${config.id}`
  const size = SIZES[config.text.size]
  const avatar = resolveAvatar(config, options)
  const label = badgeText(config)
  const cssText = buildCss(config, avatar)
  const inner = [
    avatarHtml(c, avatar, size.avatar),
    textHtml(c, config),
    config.shape.showIcon ? strokeSvg(`${c}__ic`, size.icon, ARROW_ICON) : '',
  ].filter(Boolean)

  const { url, newTab } = config.click.link
  const isMail = url.startsWith('mailto:')
  const blank = newTab && !isMail
  const attrs = [`class="${c}__pill"`, `href="${escapeHtml(url || '#')}"`]
  if (blank) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
  if (blank) attrs.push(`aria-label="${escapeHtml(`${label}, opens in a new tab`)}"`)
  const pill = `  <a ${attrs.join(' ')}>\n    ${inner.join('\n    ')}\n  </a>`
  const html = `<div class="${c}">\n${pill}\n</div>`

  const header = `<!-- Stampit badge${options.editUrl ? ` · edit: ${commentSafe(options.editUrl)}` : ''} -->`
  const code = [header, `<style>${cssText}</style>`, html].join('\n') + '\n'
  return { html, css: cssText, js: null, code }
}

export function generateHtml(config: BadgeConfig, options: GenerateHtmlOptions = {}): string {
  return generateBadge(config, options).code
}
