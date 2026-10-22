import { bestOn, contrastRatio } from '../contrast'
import type { BadgeConfig, BadgeSize, Palette } from '../schema'
import { CHANNELS, channelLabel } from '../channels'
import { CSS_SPRINGS, TOOLTIP_DELAY, type CssSpringName } from '../springs-css'
import { badgeRuntime } from './runtime'

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
  /**
   * Preview only: with "Adapt to site theme", show one palette regardless of
   * the OS setting (the editor's preview background picks it). The copied
   * snippet never sets this.
   */
  previewScheme?: 'light' | 'dark'
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
/** Rounded play triangle, pointing right. */
export const TRIANGLE_ICON = '<path d="M9 7l6 5-6 5z" fill="currentColor"/>'
/** Lucide "link". */
export const LINK_ICON =
  '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'

export const LINK_ICONS: Record<BadgeConfig['shape']['iconStyle'], { body: string; hover: string }> = {
  arrow: { body: ARROW_ICON, hover: 'translate(2px,-2px)' },
  triangle: { body: TRIANGLE_ICON, hover: 'translateX(2px)' },
  link: { body: LINK_ICON, hover: 'rotate(-15deg)' },
}

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

function buildCss(config: BadgeConfig, avatar: ResolvedAvatar, previewScheme?: 'light' | 'dark'): string {
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
  const bubbles = config.click.mode === 'bubbles'
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
    `.${c}{${vars.join(';')};display:inline-block;position:relative;vertical-align:middle;font-family:${FONT_STACKS[config.text.font]};font-size:${size.text}px;font-weight:400;font-style:normal;font-variant:normal;line-height:1.2;text-align:left;white-space:nowrap;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`,
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
  const hover = config.motion.hover
  const pillTransitions: string[] = []
  if (soft) pillTransitions.push(transition(ctx, 'box-shadow', 'fast'))
  if (hover === 'grow' || hover === 'lift') pillTransitions.push(transition(ctx, 'transform', 'fast'))
  if (pillTransitions.length) pill.push(`transition:${pillTransitions.join(',')}`)
  rules.push(`.${c}__pill{${pill.join(';')}}`)
  if (soft) rules.push(`.${c}__pill:hover{box-shadow:${shadow(SOFT_SHADOW_HOVER)}}`)
  rules.push(...motionRules(ctx))
  rules.push(`.${c}__pill:focus-visible{outline:2px solid var(${v}tb);outline-offset:2px}`)
  if (bubbles) rules.push(`.${c}__pill{-webkit-appearance:none;appearance:none;text-align:left}`)

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

  if (showIcon && !bubbles) {
    // Link: the icon nudges on hover and focus (arrow: 2px up-right).
    rules.push(`.${c}__ic{flex:none;display:block;color:var(${v}ic);transition:${transition(ctx, 'transform', 'fast')}}`)
    rules.push(
      `.${c}__pill:hover .${c}__ic,.${c}__pill:focus-visible .${c}__ic{transform:${LINK_ICONS[config.shape.iconStyle].hover}}`,
    )
  }
  if (showIcon && bubbles) {
    // Bubbles: the "+" nudges on hover and turns into "×" when open.
    rules.push(`.${c}__ic{flex:none;display:block;color:var(${v}ic);transition:${transition(ctx, 'transform', 'moderate')}}`)
    rules.push(`.${c}__pill:hover .${c}__ic{transform:rotate(15deg)}`)
    rules.push(`.${c}__pill[aria-expanded=true] .${c}__ic{transform:rotate(45deg)}`)
  }
  if (bubbles) rules.push(...bubbleRules(ctx, { radius: config.shape.radius, ring, soft, anyBlur }))

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
    if (previewScheme === 'dark') rules.push(darkRules)
    else if (previewScheme !== 'light') rules.push(`@media (prefers-color-scheme:dark){${darkRules}}`)
  }

  // Reduced motion: nothing travels, rotates or scales; state changes are instant or fade.
  const reduced = [`.${c}__ic{transition:none}`]
  if (config.motion.entrance !== 'none' || config.motion.hover !== 'none') {
    reduced.push(`.${c},.${c} .${c}__pill,.${c} .${c}__pill:hover{animation:none;transform:none}`)
  }
  if (!bubbles) {
    reduced.push(`.${c} .${c}__pill:hover .${c}__ic,.${c} .${c}__pill:focus-visible .${c}__ic{transform:none}`)
  } else {
    reduced.push(
      `.${c} .${c}__pill[aria-expanded=false]:hover .${c}__ic{transform:none}`,
      `.${c}[data-js] .${c}__menu li,.${c}[data-js] .${c}__menu[data-open] li{transform:none;transition-property:opacity;transition-delay:0s}`,
      `.${c} .${c}__bub,.${c} .${c}__bub:hover{transform:none;transition:none}`,
    )
  }
  rules.push(`@media (prefers-reduced-motion:reduce){${reduced.join('')}}`)
  if (bubbles) rules.push(`@media print{.${c}__menu{display:none}}`)

  // Custom properties for the springs actually used, declared once.
  if (ctx.springs.size > 0) {
    const decl = [...ctx.springs].map((n) => `${v}${CSS_SPRINGS[n].name}:${CSS_SPRINGS[n].easing}`).join(';')
    rules.unshift(`.${c}{${decl}}`)
  }
  return rules.join('')
}

const ENTRANCE_FRAMES: Record<Exclude<BadgeConfig['motion']['entrance'], 'none'>, { frames: string; tier: CssSpringName }> = {
  fade: { frames: 'from{opacity:0}', tier: 'moderate' },
  grow: { frames: 'from{opacity:0;transform:scale(.6)}', tier: 'slow' },
  slide: { frames: 'from{opacity:0;transform:translateY(8px)}', tier: 'slow' },
  pulse: { frames: '0%{opacity:0;transform:scale(.9)}50%{opacity:1;transform:scale(1.06)}100%{transform:none}', tier: 'attention' },
  shake: { frames: '0%,100%{transform:none}20%,60%{transform:translateX(-3px)}40%,80%{transform:translateX(3px)}', tier: 'attention' },
}

/**
 * Appear animation on the wrapper (so it never restarts when a hover
 * animation on the pill ends), hover effect on the pill.
 */
function motionRules(ctx: CssContext): string[] {
  const { c, config } = ctx
  const { entrance, hover } = config.motion
  const rules: string[] = []
  if (entrance !== 'none') {
    const { frames, tier } = ENTRANCE_FRAMES[entrance]
    rules.push(`@keyframes ${c}-in{${frames}}`)
    rules.push(`.${c}{animation:${c}-in ${CSS_SPRINGS[tier].duration} ${springVar(ctx, tier)} backwards}`)
  }
  switch (hover) {
    case 'grow':
      rules.push(`.${c}__pill:hover{transform:scale(1.04)}`)
      break
    case 'lift':
      rules.push(`.${c}__pill:hover{transform:translateY(-2px)}`)
      break
    case 'pulse':
      rules.push(`@keyframes ${c}-hv{50%{transform:scale(1.05)}}`)
      rules.push(`.${c}__pill:hover{animation:${c}-hv ${CSS_SPRINGS.attention.duration} ${springVar(ctx, 'attention')} infinite}`)
      break
    case 'shake':
      rules.push(`@keyframes ${c}-hv{20%,60%{transform:translateX(-2px)}40%,80%{transform:translateX(2px)}}`)
      rules.push(`.${c}__pill:hover{animation:${c}-hv ${CSS_SPRINGS.attention.duration} ${springVar(ctx, 'attention')}}`)
      break
  }
  return rules
}

/** §8 — the bubble menu. Only emitted in Bubbles mode. */
function bubbleRules(
  ctx: CssContext,
  { radius, ring, soft, anyBlur }: { radius: number; ring: string; soft: boolean; anyBlur: boolean },
): string[] {
  const { c, v, config } = ctx
  const size = SIZES[config.text.size]
  const b = size.bubble
  const withLabels = config.click.bubbles.labels === 'icon-label'
  const bubbleRadius = Math.round(((radius * b) / 2) * 100) / 100
  const shadow = [ring, soft ? SOFT_SHADOW : ''].filter(Boolean).join(',') || 'none'
  const hit = Math.max(0, (44 - b) / 2)
  const rules: string[] = []

  // Closed by default; the popover (or the fallback class) shows it. Without
  // JS the UA centres it on screen as a plain row.
  rules.push(
    `.${c}__menu{display:none;position:fixed;inset:0;width:fit-content;height:fit-content;max-width:calc(100vw - 16px);margin:auto;padding:8px;overflow:visible;background:none;border:0;color:inherit;flex-wrap:wrap;justify-content:center;gap:8px;transition:display ${CSS_SPRINGS.slowExit.duration} allow-discrete,overlay ${CSS_SPRINGS.slowExit.duration} allow-discrete}`,
  )
  rules.push(`.${c}__menu:popover-open{display:flex}`)
  rules.push(`.${c}__menu.is-open{display:flex}`)
  rules.push(`.${c}__menu li{position:relative;display:flex;flex-direction:column;align-items:center}`)

  // With JS: a viewport-sized, click-through layer; each bubble placed by the script.
  rules.push(
    `.${c}[data-js] .${c}__menu{width:auto;height:auto;max-width:none;margin:0;padding:0;pointer-events:none}`,
  )
  rules.push(
    `.${c}[data-js] .${c}__menu li{position:absolute;pointer-events:auto;opacity:0;transform:translate(var(--dx,0),var(--dy,0)) scale(.6);transition:${transition(ctx, 'transform', 'slowExit')},${transition(ctx, 'opacity', 'slowExit')}}`,
  )
  rules.push(
    `.${c}[data-js] .${c}__menu[data-open] li{opacity:1;transform:none;transition:${transition(ctx, 'transform', 'slow', 'var(--d,0s)')},${transition(ctx, 'opacity', 'slow', 'var(--d,0s)')}}`,
  )

  const bub = [
    'position:relative',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    `gap:${size.gap - 2}px`,
    `min-width:${b}px`,
    `height:${b}px`,
    withLabels ? `padding:0 ${size.padRight + 2}px 0 ${size.padRight}px` : 'padding:0',
    `border-radius:${bubbleRadius}px`,
    `background:var(${v}bg)`,
    `box-shadow:${shadow}`,
    `color:var(${v}ic)`,
    'white-space:nowrap',
    'outline:none',
    '-webkit-tap-highlight-color:transparent',
    `transition:${transition(ctx, 'transform', 'fast')}`,
  ]
  if (anyBlur) bub.push(`-webkit-backdrop-filter:blur(var(${v}blur))`, `backdrop-filter:blur(var(${v}blur))`)
  rules.push(`.${c}__bub{${bub.join(';')}}`)
  if (hit > 0) rules.push(`.${c}__bub::before{content:"";position:absolute;inset:-${hit}px}`)
  rules.push(`.${c}__bub:hover{transform:scale(1.08)}`)
  rules.push(`.${c}__bub:focus-visible{outline:2px solid var(${v}tb);outline-offset:2px}`)
  rules.push(`.${c}__bub svg{display:block;flex:none;width:18px;height:18px}`)

  if (withLabels) {
    rules.push(`.${c}__lb{color:var(${v}tb);font-size:${size.text - 1}px}`)
  } else {
    // Tooltip: after a hover delay, at once on keyboard focus.
    rules.push(
      `.${c}__tip{position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);padding:4px 8px;border-radius:6px;background:rgba(0,0,0,.85);color:#fff;font-size:12px;line-height:16px;white-space:nowrap;pointer-events:none;opacity:0;transition:${transition(ctx, 'opacity', 'fast')}}`,
    )
    rules.push(`.${c}__menu[data-side=bottom] .${c}__tip{bottom:auto;top:calc(100% + 6px)}`)
    rules.push(`.${c}__bub:hover+.${c}__tip{opacity:1;transition-delay:${TOOLTIP_DELAY}}`)
    rules.push(`.${c}__bub:focus-visible+.${c}__tip{opacity:1;transition-delay:0s}`)
    // Touch screens: no hover, so the names sit under the bubbles.
    rules.push(
      `@media (hover:none){.${c}__tip,.${c}__menu[data-side=bottom] .${c}__tip{position:static;transform:none;margin-top:4px;padding:0;background:none;color:var(${v}tb);font-size:11px;line-height:14px;opacity:1}}`,
    )
  }
  return rules
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

function channelIconSvg(type: keyof typeof CHANNELS): string {
  const icon = CHANNELS[type].icon
  return icon.kind === 'fill'
    ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false"><path d="${icon.d}"/></svg>`
    : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${icon.d}"/></svg>`
}

function bubblesHtml(c: string, config: BadgeConfig): string {
  const { channels, labels } = config.click.bubbles
  const newTab = config.click.link.newTab
  const bold = config.text.bold.trim()
  const items = channels.map((ch) => {
    const name = channelLabel(ch)
    const isMail = ch.type === 'email' || ch.url.startsWith('mailto:')
    const blank = newTab && !isMail
    const aria = isMail ? `Email${bold ? ` ${bold}` : ''}` : blank ? `${name}, opens in a new tab` : name
    const attrs = [`class="${c}__bub"`, `href="${escapeHtml(ch.url || '#')}"`]
    if (blank) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
    attrs.push(`aria-label="${escapeHtml(aria)}"`)
    const inside =
      labels === 'icon-label'
        ? `${channelIconSvg(ch.type)}<span class="${c}__lb">${escapeHtml(name)}</span>`
        : channelIconSvg(ch.type)
    const tip = labels === 'icon' ? `<span class="${c}__tip" aria-hidden="true">${escapeHtml(name)}</span>` : ''
    return `    <li><a ${attrs.join(' ')}>${inside}</a>${tip}</li>`
  })
  return `  <ul id="${c}-menu" popover="auto" class="${c}__menu">\n${items.join('\n')}\n  </ul>`
}

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
  const cssText = buildCss(config, avatar, options.previewScheme)
  const bubbles = config.click.mode === 'bubbles'
  const inner = [
    avatarHtml(c, avatar, size.avatar),
    textHtml(c, config),
    config.shape.showIcon
      ? strokeSvg(`${c}__ic`, size.icon, bubbles ? PLUS_ICON : LINK_ICONS[config.shape.iconStyle].body)
      : '',
  ].filter(Boolean)
  const body = `\n    ${inner.join('\n    ')}\n  `

  let html: string
  let js: string | null = null
  if (bubbles) {
    // Disclosure pattern: a button that shows a list of links (§8.1).
    const menuId = `${c}-menu`
    const attrs = [
      'type="button"',
      `class="${c}__pill"`,
      `popovertarget="${menuId}"`,
      'aria-expanded="false"',
      `aria-controls="${menuId}"`,
      `aria-label="${escapeHtml(label ? `${label}, show links` : 'Show links')}"`,
    ]
    html = `<div class="${c}">\n  <button ${attrs.join(' ')}>${body}</button>\n${bubblesHtml(c, config)}\n</div>`
    js = badgeRuntime(c)
  } else {
    const { url, newTab } = config.click.link
    const isMail = url.startsWith('mailto:')
    const blank = newTab && !isMail
    const attrs = [`class="${c}__pill"`, `href="${escapeHtml(url || '#')}"`]
    if (blank) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
    if (blank) attrs.push(`aria-label="${escapeHtml(`${label}, opens in a new tab`)}"`)
    html = `<div class="${c}">\n  <a ${attrs.join(' ')}>${body}</a>\n</div>`
  }

  const header = `<!-- Stampit badge${options.editUrl ? ` · edit: ${commentSafe(options.editUrl)}` : ''} -->`
  const parts = [header, `<style>${cssText}</style>`, html]
  if (js) parts.push(`<script>${js}</script>`)
  const code = parts.join('\n') + '\n'
  return { html, css: cssText, js, code }
}

export function generateHtml(config: BadgeConfig, options: GenerateHtmlOptions = {}): string {
  return generateBadge(config, options).code
}
