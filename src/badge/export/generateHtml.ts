import { bestOn, contrastRatio, parseHex, relativeLuminance } from '../contrast'
import { SOCIALS, type BadgeConfig, type BadgeSize, type Layout, type Palette, type SocialNetwork } from '../schema'
import { CHANNELS, domainMatches, isValidUrl } from '../channels'
import { SOCIAL_STAGGER_MS, CSS_SPRINGS, type CssSpringName } from '../springs-css'
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
  /** Origin that site-relative avatar paths (`/avatars/…`) resolve against, so exports work on any site. */
  assetOrigin?: string
  /** The editor saw the avatar image fail: render initials instead. */
  avatarFailed?: boolean
  /**
   * Preview only: with "Adapt to site theme", show one palette regardless of
   * the OS setting (the editor's preview background picks it). The copied
   * snippet never sets this.
   */
  previewScheme?: 'light' | 'dark'
  /** Preview only: leave out the appear animation (it would replay on every edit). */
  skipEntrance?: boolean
  /**
   * Preview only: the hover effect also plays while an ancestor carries this
   * attribute, so the editor can show it without the pointer on the badge.
   */
  hoverDemoAttr?: string
}

/** Stamp diameter per size, in px. */
export const STAMP_SIZES: Record<BadgeSize, number> = { s: 96, m: 112, l: 128 }

/** Stamp geometry, in SVG units (viewBox 100): the text baseline circle, inside the edge. */
const RING_RADIUS = 37
const RING_LENGTH = Math.round(2 * Math.PI * RING_RADIUS * 10) / 10

function stampText(config: BadgeConfig): string {
  // Non-breaking spaces: SVG drops the trailing ordinary one, which left the dot stuck to the first word.
  return `${badgeText(config).toUpperCase()}\u00A0•\u00A0`
}

/** Normal and bold text in display order, the bold one in its own tspan, then the separator. */
function ringTspans(c: string, config: BadgeConfig): string {
  const normal = escapeHtml(config.text.normal.trim().toUpperCase())
  const bold = config.text.bold.trim().toUpperCase()
  const b = bold ? `<tspan class="${c}__rb">${escapeHtml(bold)}</tspan>` : ''
  const parts = (config.text.order === 'normal-first' ? [normal, b] : [b, normal]).filter(Boolean)
  return `${parts.join(' ')}\u00A0•\u00A0`
}

/** Fills the whole turn: extra-bold capitals are about 0.72 em wide; never above 9.5 units. */
export function stampFontSize(config: BadgeConfig): number {
  const chars = Array.from(stampText(config)).length
  return Math.round(Math.min(9.5, RING_LENGTH / (chars * 0.72)) * 10) / 10
}

/** Layouts that always show an avatar (initials when there is no photo). */
const NEEDS_AVATAR: ReadonlySet<Layout> = new Set(['stamp', 'card', 'team'])

/** Team members' initials sit on these colors, in order. */
export const TEAM_COLORS = ['#5B8DEF', '#3BB273', '#E15A97', '#F2A541', '#8E6CEF']

/** Profile mode: the badge is a button that opens the profile modal. */
export function usesProfile(config: BadgeConfig): boolean {
  return config.click.mode === 'profile'
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
  const name = config.layout === 'team' ? teamNames(config) : bold
  const parts = order === 'normal-first' ? [normal, name] : [name, normal]
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return (words.slice(0, 2).map((w) => Array.from(w)[0] ?? '').join('') || '?').toUpperCase()
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''

/** Team members with a name. */
export function teamMembers(config: BadgeConfig): string[] {
  return config.team.map((n) => n.trim()).filter(Boolean)
}

/** "Olivier", "Olivier & Camille", "Olivier, Camille & Lucas", "Olivier, Camille & 3 others". */
export function teamNames(config: BadgeConfig): string {
  const lead = config.text.bold.trim()
  const others = teamMembers(config)
  if (!others.length) return lead
  const names = [firstName(lead) || lead, ...others.map(firstName)].filter(Boolean)
  if (names.length <= 3) return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
  return `${names.slice(0, 2).join(', ')} & ${names.length - 2} others`
}

export type ResolvedAvatar =
  | { kind: 'none' }
  | { kind: 'initials'; initials: string }
  | { kind: 'image'; src: string }

export function resolveAvatar(config: BadgeConfig, options: GenerateHtmlOptions = {}): ResolvedAvatar {
  const { source, url } = config.avatar
  const initials = { kind: 'initials' as const, initials: deriveInitials(config) }
  if (source === 'none') return NEEDS_AVATAR.has(config.layout) ? initials : { kind: 'none' }
  if (source === 'initials' || options.avatarFailed) return initials
  if (!url) return initials
  const src = options.assetOrigin && url.startsWith('/') ? options.assetOrigin + url : url
  return { kind: 'image', src }
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

/** Lucide "x", the modal's close button. */
export const CLOSE_ICON = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'

function strokeSvg(cls: string, size: number, body: string): string {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

/**
 * The Shine band: white on a dark or see-through surface, a faint dark band on
 * a light one (white on white would not show).
 */
export function sheenColor(p: Palette): string {
  const bg = parseHex(p.background)
  return bg.a < 0.5 || relativeLuminance(bg) < 0.4 ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.12)'
}

function paletteVars(p: Palette, prefix: string, profile = false): string {
  const vars = [
    `${prefix}bg:${css(p.background)}`,
    `${prefix}bd:${css(p.border)}`,
    `${prefix}tn:${css(p.textNormal)}`,
    `${prefix}tb:${css(p.textBold)}`,
    `${prefix}ic:${css(p.icon)}`,
  ]
  // Text on a bold-colored surface (the modal's Portfolio button).
  if (profile) vars.push(`${prefix}on:${css(bestOn(p.textBold.slice(0, 7)))}`)
  return vars.join(';')
}

type CssContext = {
  c: string // class prefix, e.g. "sp-abc123"
  v: string // custom property prefix, e.g. "--sp-abc123-"
  config: BadgeConfig
  springs: Set<CssSpringName>
  /** Preview only: see `GenerateHtmlOptions.hoverDemoAttr`. */
  hoverDemoAttr?: string
}

/** `.c__pill:hover`, plus the preview's demo trigger when there is one. */
function pillHover(ctx: CssContext, prefix = ''): string {
  const own = `${prefix}.${ctx.c}__pill:hover`
  return ctx.hoverDemoAttr ? `${own},[${ctx.hoverDemoAttr}] ${prefix}.${ctx.c}__pill` : own
}

function springVar(ctx: CssContext, name: CssSpringName): string {
  ctx.springs.add(name)
  return `var(${ctx.v}${CSS_SPRINGS[name].name})`
}

function transition(ctx: CssContext, property: string, name: CssSpringName, delay = ''): string {
  return `${property} ${CSS_SPRINGS[name].duration} ${springVar(ctx, name)}${delay ? ` ${delay}` : ''}`
}

function buildCss(
  config: BadgeConfig,
  avatar: ResolvedAvatar,
  previewScheme?: 'light' | 'dark',
  hoverDemoAttr?: string,
): string {
  const id = config.id
  const ctx: CssContext = { c: `sp-${id}`, v: `--sp-${id}-`, config, springs: new Set(), hoverDemoAttr }
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
  const profile = usesProfile(config)
  const layout = config.layout
  const anyBlur = adaptToSite ? palettes.light.blur > 0 || palettes.dark.blur > 0 : lightOrBase.blur > 0

  const ring = border > 0 ? `inset 0 0 0 ${border}px var(${v}bd)` : ''
  const shadow = (s: string) => [ring, soft ? s : ''].filter(Boolean).join(',') || 'none'

  const rules: string[] = []
  // Reset: the badge must survive aggressive host CSS.
  rules.push(
    `.${c},.${c} *,.${c} *::before,.${c} *::after{box-sizing:border-box;margin:0;padding:0;border:0;font:inherit;line-height:inherit;letter-spacing:normal;text-transform:none;text-decoration:none;list-style:none;background:none;color:inherit;max-width:none;min-width:0;float:none}`,
  )
  const vars = [paletteVars(lightOrBase, v, profile)]
  if (anyBlur) vars.push(`${v}blur:${lightOrBase.blur}px`)
  const shine = config.motion.entrance === 'shine' || config.motion.repeat === 'shine'
  if (shine) vars.push(`${v}sh:${sheenColor(lightOrBase)}`)
  rules.push(
    `.${c}{${vars.join(';')};display:inline-flex;align-items:center;gap:6px;position:relative;vertical-align:middle;font-family:${FONT_STACKS[config.text.font]};font-size:${size.text}px;font-weight:400;font-style:normal;font-variant:normal;line-height:1.2;text-align:left;white-space:nowrap;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`,
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
  if (profile) rules.push(`.${c}__pill,.${c}__lk{-webkit-appearance:none;appearance:none;text-align:left}`)

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
    // The icon nudges on hover and focus (arrow: 2px up-right).
    rules.push(`.${c}__ic{flex:none;display:block;color:var(${v}ic);transition:${transition(ctx, 'transform', 'fast')}}`)
    rules.push(
      `.${c}__pill:hover .${c}__ic,.${c}__pill:focus-visible .${c}__ic{transform:${LINK_ICONS[config.shape.iconStyle].hover}}`,
    )
  }
  // Profile mode: the social links move into the modal.
  if (profile) rules.push(...profileRules(ctx, { avatar, ring, anyBlur }))
  else if (activeSocials(config).length) rules.push(...socialRules(ctx, { radius, ring, soft, anyBlur }))
  rules.push(...layoutRules(ctx, { padLeft }))

  if (adaptToSite) {
    const dark = palettes.dark
    const darkVars = [paletteVars(dark, v, profile)]
    if (anyBlur) darkVars.push(`${v}blur:${dark.blur}px`)
    if (shine && sheenColor(dark) !== sheenColor(palettes.light)) darkVars.push(`${v}sh:${sheenColor(dark)}`)
    let darkRules = `.${c}{${darkVars.join(';')}}`
    // The modal shows initials even when the badge has no avatar.
    if (avatar.kind === 'initials' || (profile && avatar.kind === 'none')) {
      const lightInitials = initialsColor(config, palettes.light)
      const darkInitials = initialsColor(config, dark)
      if (lightInitials !== darkInitials) darkRules += `.${c}__av${profile ? `,.${c}__mav` : ''}{color:${css(darkInitials)}}`
    }
    if (previewScheme === 'dark') rules.push(darkRules)
    else if (previewScheme !== 'light') rules.push(`@media (prefers-color-scheme:dark){${darkRules}}`)
  }

  // Reduced motion: nothing travels, rotates or scales; state changes are instant or fade.
  const reduced = [`.${c}__ic{transition:none}`]
  if (config.motion.entrance !== 'none' || config.motion.repeat !== 'none' || config.motion.hover !== 'none') {
    reduced.push(`.${c},.${c} .${c}__pill,${pillHover(ctx, `.${c} `)}{animation:none;transform:none}.${c} .${c}__pill::after{animation:none;opacity:0}`)
  }
  if (layout === 'stamp') reduced.push(`.${c} .${c}__ring{animation:none}`)

  reduced.push(`.${c} .${c}__pill:hover .${c}__ic,.${c} .${c}__pill:focus-visible .${c}__ic{transform:none}`)
  // The modal fades in place.
  if (profile) reduced.push(`.${c} .${c}__dlg,.${c} .${c}__dlg[open]{transform:none}`)
  rules.push(`@media (prefers-reduced-motion:reduce){${reduced.join('')}}`)

  // Custom properties for the springs actually used, declared once.
  if (ctx.springs.size > 0) {
    const decl = [...ctx.springs].map((n) => `${v}${CSS_SPRINGS[n].name}:${CSS_SPRINGS[n].easing}`).join(';')
    rules.unshift(`.${c}{${decl}}`)
  }
  return rules.join('')
}

const ENTRANCE_FRAMES: Record<'shake' | 'bump', { frames: string; tier: CssSpringName }> = {
  shake: { frames: '0%,100%{transform:none}20%,60%{transform:translateX(-3px)}40%,80%{transform:translateX(3px)}', tier: 'attention' },
  bump: { frames: '0%,100%{transform:none}35%{transform:scale(1.08)}65%{transform:scale(.97)}', tier: 'attention' },
}

/** Keyframes for one "On delay" cycle: the effect at the start, then rest. */
function repeatFrames(effect: Exclude<BadgeConfig['motion']['repeat'], 'none'>): string {
  const period = parseFloat(CSS_SPRINGS.repeat.duration)
  const pct = (seconds: number, at: number) => `${Math.round(((seconds / period) * at) * 1000) / 10}%`
  const attention = parseFloat(CSS_SPRINGS.attention.duration)
  switch (effect) {
    case 'shake': {
      const p = (at: number) => pct(attention, at)
      return `0%,${p(1)},100%{transform:none}${p(0.2)},${p(0.6)}{transform:translateX(-3px)}${p(0.4)},${p(0.8)}{transform:translateX(3px)}`
    }
    case 'bump': {
      const p = (at: number) => pct(attention, at)
      return `0%,${p(1)},100%{transform:none}${p(0.35)}{transform:scale(1.08)}${p(0.65)}{transform:scale(.97)}`
    }
    case 'shine': {
      const end = pct(parseFloat(CSS_SPRINGS.shine.duration), 1)
      return `0%{transform:translateX(-110%)}${end},100%{transform:translateX(110%)}`
    }
  }
}

/**
 * Appear animation on the wrapper (so it never restarts when a hover
 * animation on the pill ends), hover effect on the pill.
 */
function motionRules(ctx: CssContext): string[] {
  const { c, config } = ctx
  const { entrance, repeat, hover } = config.motion
  const rules: string[] = []
  // Appear (once) and On delay (every few seconds) can stack on the same
  // element: their animations are listed together.
  const wrapper: string[] = []
  const sheen: string[] = []

  if (entrance === 'shake' || entrance === 'bump') {
    const { frames, tier } = ENTRANCE_FRAMES[entrance]
    rules.push(`@keyframes ${c}-in{${frames}}`)
    wrapper.push(`${c}-in ${CSS_SPRINGS[tier].duration} ${springVar(ctx, tier)} backwards`)
  }
  if (entrance === 'shine') {
    rules.push(`@keyframes ${c}-in{from{transform:translateX(-110%)}to{transform:translateX(110%)}}`)
    sheen.push(`${c}-in ${CSS_SPRINGS.shine.duration} ${springVar(ctx, 'shine')} .2s backwards`)
  }
  if (repeat !== 'none') {
    // One cycle = the effect, then rest; no fill, so the first wait leaves
    // the appear animation alone.
    const period = CSS_SPRINGS.repeat.duration
    rules.push(`@keyframes ${c}-rp{${repeatFrames(repeat)}}`)
    const anim = `${c}-rp ${period} ${springVar(ctx, 'repeat')} ${period} infinite`
    if (repeat === 'shine') sheen.push(anim)
    else wrapper.push(anim)
  }
  if (wrapper.length) rules.push(`.${c}{animation:${wrapper.join(',')}}`)
  if (sheen.length) {
    // A light band sweeps across the pill, clipped to its shape.
    rules.push(`.${c}__pill{position:relative;overflow:hidden}`)
    rules.push(
      `.${c}__pill::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(105deg,transparent 30%,var(${ctx.v}sh) 50%,transparent 70%);transform:translateX(110%);animation:${sheen.join(',')}}`,
    )
  }
  switch (hover) {
    case 'grow':
      rules.push(`${pillHover(ctx)}{transform:scale(1.04)}`)
      break
    case 'lift':
      rules.push(`${pillHover(ctx)}{transform:translateY(-2px)}`)
      break
    case 'pulse':
      rules.push(`@keyframes ${c}-hv{50%{transform:scale(1.05)}}`)
      rules.push(`${pillHover(ctx)}{animation:${c}-hv ${CSS_SPRINGS.attention.duration} ${springVar(ctx, 'attention')} infinite}`)
      break
    case 'shake':
      rules.push(`@keyframes ${c}-hv{20%,60%{transform:translateX(-2px)}40%,80%{transform:translateX(2px)}}`)
      rules.push(`${pillHover(ctx)}{animation:${c}-hv ${CSS_SPRINGS.attention.duration} ${springVar(ctx, 'attention')}}`)
      break
  }
  return rules
}

/** What each non-pill layout changes on top of the pill rules (same specificity, later wins). */
function layoutRules(
  ctx: CssContext,
  { padLeft }: { padLeft: number },
): string[] {
  const { c, v, config } = ctx
  const size = SIZES[config.text.size]
  const layout = config.layout
  const rules: string[] = []

  switch (layout) {
    case 'pill':
      break



    case 'stamp': {
      const d = STAMP_SIZES[config.text.size]
      const av = Math.round(d * 0.44)
      rules.push(
        `.${c}__pill{position:relative;justify-content:center;width:${d}px;height:${d}px;padding:0;gap:0;border-radius:50%}`,
        `.${c}__av{width:${av}px;height:${av}px;border-radius:50%;font-size:${Math.round(av * 0.36)}px}`,
        `@keyframes ${c}-spin{to{transform:rotate(360deg)}}`,
        `.${c}__ring{position:absolute;inset:0;display:block;width:100%;height:100%;overflow:visible;pointer-events:none;animation:${c}-spin 24s linear infinite}`,
        // In CSS, not as an attribute: the reset's font:inherit would win over it.
        `.${c}__ring text{fill:var(${v}tn);font-size:${stampFontSize(config)}px;font-weight:500}`,
        // Only the bold text is bold, as on the pill.
        `.${c}__ring .${c}__rb{fill:var(${v}tb);font-weight:650}`,
        `.${c}__ring circle{fill:none;stroke:var(${v}bd);stroke-width:1}`,
      )
      break
    }

    case 'split': {
      // shields.io style: the normal text on the badge surface, the name on an inverted one.
      rules.push(
        `.${c}__pill{gap:0;padding:0;overflow:hidden}`,
        `.${c}__l,.${c}__r{display:flex;align-items:center;height:100%}`,
        `.${c}__l{gap:${size.gap}px;padding:0 ${size.gap}px 0 ${padLeft}px}`,
        `.${c}__r{gap:6px;padding:0 ${size.padRight}px 0 ${size.gap}px;background:var(${v}tb);color:var(${v}bg)}`,
        `.${c}__r .${c}__b,.${c}__r .${c}__ic{color:inherit}`,
      )
      break
    }


    case 'team': {
      const overlap = Math.round(size.avatar * 0.32)
      rules.push(
        `.${c}__stk{display:flex;flex:none}`,
        `.${c}__stk .${c}__av{position:relative;box-shadow:0 0 0 2px var(${v}bg)}`,
        `.${c}__stk .${c}__av+.${c}__av{margin-left:-${overlap}px}`,
        `.${c}__stk .${c}__tm{color:#fff;font-size:${Math.round(size.avatar * 0.36)}px;font-weight:600;line-height:1}`,
        ...TEAM_COLORS.slice(0, 2).map((color, i) => `.${c}__stk .${c}__tm:nth-child(${i + 2}){background:${css(color)}}`),
        // The lead avatar on top.
        `.${c}__stk .${c}__av:nth-child(1){z-index:3}.${c}__stk .${c}__av:nth-child(2){z-index:2}`,
      )
      break
    }

    case 'card': {
      const r = Math.round(8 + config.shape.radius * 12)
      const av = 44
      rules.push(
        `.${c}__pill{position:relative;flex-direction:column;align-items:stretch;width:auto;min-width:240px;height:auto;padding:14px;gap:12px;border-radius:${r}px;cursor:default}`,
        `.${c}__lk{display:flex;align-items:center;gap:12px;color:inherit;outline:none;cursor:pointer}`,
        // The whole card is the link's hit area; the social links sit above it.
        `.${c}__lk::before{content:"";position:absolute;inset:0;border-radius:inherit}`,
        `.${c}__lk:focus-visible::before{outline:2px solid var(${v}tb);outline-offset:2px}`,
        `.${c}__av{width:${av}px;height:${av}px;border-radius:${config.shape.radius >= 0.5 ? '50%' : `${r - 4}px`};font-size:17px}`,
        `.${c}__ct{display:flex;flex-direction:column;gap:1px;min-width:0;line-height:1.25}`,
        `.${c}__ct .${c}__n{font-size:12px}`,
        `.${c}__ct .${c}__b{font-size:16px}`,
        `.${c}__ro{font-size:13px;color:var(${v}tn)}`,
        `.${c}__lk .${c}__ic{margin-left:auto;align-self:flex-start}`,
        `.${c}__sos,.${c}:hover .${c}__sos{position:relative;left:auto;top:auto;bottom:auto;z-index:1;padding:0;pointer-events:auto}`,
        `.${c}__so{width:32px;height:32px;border-radius:${config.shape.radius >= 0.5 ? '50%' : '8px'};box-shadow:inset 0 0 0 1px var(${v}bd);opacity:1;transform:none;pointer-events:auto}`,
        `.${c}__so svg{width:15px;height:15px}`,
      )
      break
    }
  }
  return rules
}

/** Social links with a valid address, in display order. */
export function activeSocials(config: BadgeConfig): { network: SocialNetwork; url: string }[] {
  return SOCIALS.map((network) => ({ network, url: config.socials[network].trim() })).filter(({ url }) =>
    isValidUrl(url),
  )
}

/** Round icon links to the right of the badge: same surface, height and corner as the pill. */
function socialRules(
  ctx: CssContext,
  { radius, ring, soft, anyBlur }: { radius: number; ring: string; soft: boolean; anyBlur: boolean },
): string[] {
  const { c, v, config } = ctx
  const size = SIZES[config.text.size]
  const shadow = (s: string) => [ring, soft ? s : ''].filter(Boolean).join(',') || 'none'
  const so = [
    'flex:none',
    'display:grid',
    'place-items:center',
    `width:${size.height}px`,
    `height:${size.height}px`,
    `border-radius:${radius}px`,
    `background:var(${v}bg)`,
    `box-shadow:${shadow(SOFT_SHADOW)}`,
    `color:var(${v}ic)`,
    'outline:none',
    '-webkit-tap-highlight-color:transparent',
    // Hidden until the badge is hovered or focused.
    'opacity:0',
    'transform:translateX(-6px) scale(.8)',
    'pointer-events:none',
    `transition:${transition(ctx, 'transform', 'slowExit')},${transition(ctx, 'opacity', 'slowExit')}`,
  ]
  if (anyBlur) so.push(`-webkit-backdrop-filter:blur(var(${v}blur))`, `backdrop-filter:blur(var(${v}blur))`)
  const icon = Math.round(size.height * 0.44)
  const shown = `.${c}:hover .${c}__so,.${c}:focus-within .${c}__so`
  const reveal = [transition(ctx, 'transform', 'slow', 'var(--d)'), transition(ctx, 'opacity', 'slow', 'var(--d)')]
  if (soft) reveal.push(transition(ctx, 'box-shadow', 'fast'))
  const rules = [
    // Out of the flow, right of the pill: the badge keeps its size and place.
    `.${c}__sos{position:absolute;left:100%;top:0;bottom:0;display:flex;align-items:center;gap:6px;padding-left:6px;pointer-events:none}`,
    `.${c}:hover .${c}__sos,.${c}:focus-within .${c}__sos{pointer-events:auto}`,
    `.${c}__so{${so.join(';')}}`,
    `.${c}__so svg{display:block;width:${icon}px;height:${icon}px}`,
    `${shown}{opacity:1;transform:none;pointer-events:auto;transition:${reveal.join(',')}}`,
    `.${c}:hover .${c}__so:hover{transform:scale(1.06);transition-delay:0s${soft ? `;box-shadow:${shadow(SOFT_SHADOW_HOVER)}` : ''}}`,
    `.${c}__so:focus-visible{outline:2px solid var(${v}tb);outline-offset:2px}`,
    // Touch screens have no hover: always shown, in the flow, so the badge
    // and its links centre together.
    `@media (hover:none){.${c}__so{opacity:1;transform:none;pointer-events:auto}.${c}__sos{position:static;padding-left:0;pointer-events:auto}}`,
    `@media (prefers-reduced-motion:reduce){.${c} .${c}__so,.${c}:hover .${c}__so,.${c}:hover .${c}__so:hover{transform:none;transition-property:opacity;transition-delay:0s}}`,
  ]
  // Keep 44 px touch targets on small badges.
  if (size.height < 44) rules.push(`.${c}__so{position:relative}.${c}__so::before{content:"";position:absolute;inset:-${(44 - size.height) / 2}px}`)
  return rules
}

function socialsHtml(c: string, config: BadgeConfig): string {
  const newTab = config.click.link.newTab
  const links = activeSocials(config).map(({ network, url }, i) => {
    const name = CHANNELS[network].label
    const attrs = [`class="${c}__so"`, `href="${escapeHtml(url)}"`]
    if (newTab) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
    attrs.push(`aria-label="${escapeHtml(newTab ? `${name}, opens in a new tab` : name)}"`)
    // --d staggers the reveal, left to right.
    return `\n    <a ${attrs.join(' ')} style="--d:${i * SOCIAL_STAGGER_MS}ms">${channelIconSvg(network)}</a>`
  })
  return links.length ? `\n  <span class="${c}__sos">${links.join('')}\n  </span>` : ''
}

/** GitHub username from the GitHub social link, when it is a profile address. */
export function githubUser(config: BadgeConfig): string | null {
  const url = config.socials.github.trim()
  if (!isValidUrl(url) || !domainMatches(url, 'github')) return null
  const first = new URL(url).pathname.split('/').filter(Boolean)[0] ?? ''
  return /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(first) ? first : null
}

/** Projects with a name, in order; the link only when the address is valid. */
export function profileProjects(config: BadgeConfig): { name: string; url: string | null; description: string }[] {
  return config.click.profile.projects
    .map((p) => ({ name: p.name.trim(), url: isValidUrl(p.url.trim()) ? p.url.trim() : null, description: p.description.trim() }))
    .filter((p) => p.name)
}

/** The modal always shows a face: initials when the badge itself has no avatar. */
function modalAvatar(config: BadgeConfig, avatar: ResolvedAvatar): ResolvedAvatar {
  return avatar.kind === 'none' ? { kind: 'initials', initials: deriveInitials(config) } : avatar
}

/**
 * The profile modal: a native <dialog> on the badge's own palette, corner
 * and font. Surfaces inside it are tints of the bold text color, so they
 * read on any background.
 */
function profileRules(
  ctx: CssContext,
  { avatar, ring, anyBlur }: { avatar: ResolvedAvatar; ring: string; anyBlur: boolean },
): string[] {
  const { c, v, config } = ctx
  const round = config.shape.radius >= 0.5
  const r = Math.round(12 + config.shape.radius * 12)
  const inner = Math.max(6, r - 10)
  const tint = (pct: number) => `color-mix(in srgb,var(${v}tb) ${pct}%,transparent)`
  const shadow = [ring, '0 24px 64px rgba(0,0,0,.24)'].filter(Boolean).join(',')
  const hidden = 'opacity:0;transform:translateY(8px) scale(.97)'
  const discrete = `display ${CSS_SPRINGS.slowExit.duration} allow-discrete,overlay ${CSS_SPRINGS.slowExit.duration} allow-discrete`
  const face = modalAvatar(config, avatar)
  const { palettes, adaptToSite, base } = config.theme

  const dlg = [
    'position:fixed',
    'inset:0',
    'margin:auto',
    'width:min(400px,calc(100vw - 32px))',
    'height:fit-content',
    'max-height:calc(100dvh - 32px)',
    'overflow:auto',
    'overscroll-behavior:contain',
    'padding:24px',
    `border-radius:${r}px`,
    `background:var(${v}bg)`,
    `box-shadow:${shadow}`,
    `color:var(${v}tb)`,
    'font-size:14px',
    'line-height:1.45',
    'white-space:normal',
    'text-align:left',
    'outline:none',
    hidden,
    `transition:${transition(ctx, 'opacity', 'slowExit')},${transition(ctx, 'transform', 'slowExit')},${discrete}`,
  ]
  if (anyBlur) dlg.push('-webkit-backdrop-filter:blur(24px)', 'backdrop-filter:blur(24px)')

  const rules = [
    // The page behind stays put while the modal is open.
    `:root:has(.${c}__dlg[open]){overflow:hidden}`,
    `.${c}__dlg{${dlg.join(';')}}`,
    `.${c}__dlg[open]{opacity:1;transform:none;transition:${transition(ctx, 'opacity', 'slow')},${transition(ctx, 'transform', 'slow')},${discrete}}`,
    `@starting-style{.${c}__dlg[open]{${hidden}}}`,
    `.${c}__dlg::backdrop{background:rgba(0,0,0,0);transition:background-color ${CSS_SPRINGS.slowExit.duration},${discrete}}`,
    `.${c}__dlg[open]::backdrop{background:rgba(0,0,0,.4)}`,
    `@starting-style{.${c}__dlg[open]::backdrop{background:rgba(0,0,0,0)}}`,
    `.${c}__dlg a,.${c}__x{cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent}`,
    `.${c}__dlg a:focus-visible,.${c}__x:focus-visible{outline:2px solid var(${v}tb);outline-offset:2px}`,
    // Close button, top right.
    `.${c}__x{position:absolute;top:12px;right:12px;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;color:var(${v}ic);transition:${transition(ctx, 'background-color', 'fast')}}`,
    `.${c}__x:hover{background:${tint(8)}}`,
    // Head: avatar, name, role.
    `.${c}__mh{display:flex;align-items:center;gap:14px;padding-right:32px}`,
    `.${c}__mav{flex:none;display:grid;place-items:center;width:56px;height:56px;border-radius:${round ? '50%' : `${inner}px`};overflow:hidden;background:${css(config.avatar.background)}}`,
    `.${c}__mn{display:block;font-size:18px;font-weight:${Math.max(500, config.text.boldWeight)};line-height:1.25}`,
    `.${c}__mr{display:block;margin-top:2px;color:var(${v}tn)}`,
    `.${c}__mb{margin-top:16px;color:var(${v}tn)}`,
    // Links: Portfolio first, then the networks.
    `.${c}__ml{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:18px}`,
    `.${c}__mp{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:${round ? '18px' : `${inner}px`};background:var(${v}tb);color:var(${v}on);font-weight:500}`,
    `.${c}__ms{display:grid;place-items:center;width:36px;height:36px;border-radius:${round ? '50%' : `${inner}px`};background:${tint(6)};box-shadow:inset 0 0 0 1px var(${v}bd);color:var(${v}ic);transition:${transition(ctx, 'transform', 'fast')}}`,
    `.${c}__ms:hover{transform:scale(1.06)}`,
    `.${c}__ms svg{display:block;width:16px;height:16px}`,
    `.${c}__mi{flex:none;display:block;color:var(${v}ic);transition:${transition(ctx, 'transform', 'fast')}}`,
    `.${c}__mp .${c}__mi{color:inherit}`,
    `.${c}__dlg a:hover>.${c}__mi,.${c}__dlg a:focus-visible>.${c}__mi{transform:translate(2px,-2px)}`,
    // Sections.
    `.${c}__sec{margin-top:22px}`,
    `.${c}__mt{margin-bottom:10px;color:var(${v}tn);font-size:12px;font-weight:500;letter-spacing:.04em;text-transform:uppercase}`,
    // GitHub: a 13-week grid, one cell per day, and the totals beside it.
    `.${c}__gb{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 20px}`,
    `.${c}__gr{display:grid;grid-template-rows:repeat(7,10px);grid-auto-flow:column;grid-auto-columns:10px;gap:3px;min-width:166px;min-height:88px}`,
    `.${c}__gr i{display:block;border-radius:2px;background:${tint(8)}}`,
    `.${c}__gr i[data-l="1"]{background:${tint(28)}}`,
    `.${c}__gr i[data-l="2"]{background:${tint(50)}}`,
    `.${c}__gr i[data-l="3"]{background:${tint(75)}}`,
    `.${c}__gr i[data-l="4"]{background:var(${v}tb)}`,
    `@keyframes ${c}-ld{50%{opacity:.5}}`,
    `.${c}__gh:not([data-st=ok]) .${c}__gr{border-radius:4px;background:${tint(6)};animation:${c}-ld 1.2s ease-in-out infinite}`,
    `.${c}__gx{display:flex;flex-direction:column;gap:2px}`,
    `.${c}__gn{font-size:24px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}`,
    `.${c}__gl,.${c}__ga{color:var(${v}tn);font-size:12px}`,
    `.${c}__gu{margin-top:6px;font-size:13px;font-weight:500}`,
    `.${c}__gu:hover,.${c}__ge a:hover{text-decoration:underline}`,
    `.${c}__ge{display:none;color:var(${v}tn)}`,
    `.${c}__ge a{color:var(${v}tb)}`,
    `.${c}__gh[data-st=error] .${c}__gb{display:none}`,
    `.${c}__gh[data-st=error] .${c}__ge{display:block}`,
    // Projects.
    `.${c}__mj{display:flex;flex-direction:column;gap:8px}`,
    `.${c}__mc{position:relative;display:flex;flex-direction:column;gap:2px;padding:12px 40px 12px 14px;border-radius:${inner}px;background:${tint(5)};box-shadow:inset 0 0 0 1px var(${v}bd);transition:${transition(ctx, 'background-color', 'fast')}}`,
    `a.${c}__mc:hover{background:${tint(9)}}`,
    `.${c}__mc .${c}__mi{position:absolute;top:14px;right:14px}`,
    `.${c}__mcn{font-weight:500}`,
    `.${c}__mcd{color:var(${v}tn);font-size:13px}`,
    `@media (prefers-reduced-motion:reduce){.${c} .${c}__ms:hover,.${c} .${c}__dlg a:hover>.${c}__mi{transform:none}.${c} .${c}__gr{animation:none}}`,
  ]
  if (face.kind === 'initials') {
    rules.push(`.${c}__mav{color:${css(initialsColor(config, adaptToSite ? palettes.light : palettes[base]))};font-size:21px;font-weight:600;line-height:1}`)
  } else {
    rules.push(`.${c}__mav img{display:block;width:100%;height:100%;object-fit:cover}`)
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

/** The profile modal's markup. Closed until the badge is clicked. */
function profileHtml(c: string, config: BadgeConfig, avatar: ResolvedAvatar): string {
  const newTab = config.click.link.newTab
  const name = config.text.bold.trim() || config.text.normal.trim()
  const role = config.text.role.trim()
  const bio = config.click.profile.bio.trim()
  const portfolio = config.click.link.url.trim()
  const arrow = strokeSvg(`${c}__mi`, 14, ARROW_ICON)
  const link = (cls: string, url: string, name: string, inside: string) => {
    const blank = newTab && !url.startsWith('mailto:')
    const attrs = [cls ? `class="${c}__${cls}" ` : '', `href="${escapeHtml(url)}"`]
    if (blank) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
    if (name) attrs.push(`aria-label="${escapeHtml(blank ? `${name}, opens in a new tab` : name)}"`)
    return `<a ${attrs[0]}${attrs.slice(1).join(' ')}>${inside}</a>`
  }

  const face = modalAvatar(config, avatar)
  const faceHtml =
    face.kind === 'image'
      ? `<span class="${c}__mav" aria-hidden="true"><img src="${escapeHtml(face.src)}" alt="" width="56" height="56" decoding="async"></span>`
      : face.kind === 'initials'
        ? `<span class="${c}__mav" aria-hidden="true">${escapeHtml(face.initials)}</span>`
        : ''
  const lines: string[] = [
    `<form method="dialog"><button class="${c}__x" aria-label="Close">${strokeSvg(`${c}__xi`, 16, CLOSE_ICON)}</button></form>`,
    `<div class="${c}__mh">${faceHtml}<div><h2 id="${c}-dlg-t" class="${c}__mn">${escapeHtml(name)}</h2>${role ? `<p class="${c}__mr">${escapeHtml(role)}</p>` : ''}</div></div>`,
  ]
  if (bio) lines.push(`<p class="${c}__mb">${escapeHtml(bio)}</p>`)

  const links: string[] = []
  if (isValidUrl(portfolio)) links.push(link('mp', portfolio, newTab ? 'Portfolio' : '', `Portfolio${arrow}`))
  for (const { network, url } of activeSocials(config)) links.push(link('ms', url, CHANNELS[network].label, channelIconSvg(network)))
  if (links.length) lines.push(`<div class="${c}__ml">${links.join('')}</div>`)

  const user = githubUser(config)
  if (user) {
    const profile = `https://github.com/${user}`
    lines.push(
      `<section class="${c}__sec ${c}__gh" data-user="${user}" aria-labelledby="${c}-gh-t">`,
      `<h3 id="${c}-gh-t" class="${c}__mt">GitHub activity</h3>`,
      `<div class="${c}__gb"><div class="${c}__gr" aria-hidden="true"></div><p class="${c}__gx"><span class="${c}__gn">–</span><span class="${c}__gl">public events, last 12 weeks</span><span class="${c}__ga"></span>${link('gu', profile, '', `@${user}`)}</p></div>`,
      `<p class="${c}__ge">Activity unavailable right now. ${link('', profile, '', `See @${user} on GitHub`)}</p>`,
      '</section>',
    )
  }

  const projects = profileProjects(config)
  if (projects.length) {
    const items = projects.map((p) => {
      const inside = `<span class="${c}__mcn">${escapeHtml(p.name)}</span>${p.description ? `<span class="${c}__mcd">${escapeHtml(p.description)}</span>` : ''}`
      return `<li>${p.url ? link('mc', p.url, '', inside + arrow) : `<div class="${c}__mc">${inside}</div>`}</li>`
    })
    lines.push(`<section class="${c}__sec" aria-labelledby="${c}-pj-t"><h3 id="${c}-pj-t" class="${c}__mt">Projects</h3><ul class="${c}__mj">${items.join('')}</ul></section>`)
  }

  return `  <dialog id="${c}-dlg" class="${c}__dlg" aria-labelledby="${c}-dlg-t">\n    ${lines.join('\n    ')}\n  </dialog>`
}

function avatarHtml(c: string, avatar: ResolvedAvatar, size: number): string {
  if (avatar.kind === 'none') return ''
  if (avatar.kind === 'initials') {
    return `<span class="${c}__av" aria-hidden="true">${escapeHtml(avatar.initials)}</span>`
  }
  return `<span class="${c}__av" aria-hidden="true"><img src="${escapeHtml(avatar.src)}" alt="" width="${size}" height="${size}" decoding="async"></span>`
}

function iconHtml(c: string, config: BadgeConfig): string {
  const size = SIZES[config.text.size]
  return config.shape.showIcon ? strokeSvg(`${c}__ic`, size.icon, LINK_ICONS[config.shape.iconStyle].body) : ''
}

/** Stamp: the text runs around a circle, sized so it fills the whole turn. */
function ringHtml(c: string, config: BadgeConfig): string {
  const r = RING_RADIUS
  return `<svg class="${c}__ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path id="${c}-arc" d="M${50 - r},50a${r},${r} 0 1,1 ${2 * r},0a${r},${r} 0 1,1 -${2 * r},0" fill="none"/><circle cx="50" cy="50" r="29"/><text><textPath href="#${c}-arc" textLength="${RING_LENGTH}" lengthAdjust="spacing">${ringTspans(c, config)}</textPath></text></svg>`
}

/** The inside of the clickable element, per layout. */
function innerHtml(c: string, config: BadgeConfig, avatar: ResolvedAvatar): string[] {
  const size = SIZES[config.text.size]
  const av = avatarHtml(c, avatar, size.avatar)
  const icon = iconHtml(c, config)
  const normal = config.text.normal.trim()
  const bold = config.text.bold.trim()
  const span = (cls: string, text: string) => (text ? `<span class="${c}__${cls}">${escapeHtml(text)}</span>` : '')
  switch (config.layout) {
    case 'stamp':
      return [ringHtml(c, config), av]
    case 'split':
      return [
        `<span class="${c}__l">${av}${span('n', normal)}</span>`,
        `<span class="${c}__r">${span('b', bold)}${icon}</span>`,
      ]
    case 'team': {
      const members = teamMembers(config)
        .slice(0, 2)
        .map((name) => `<span class="${c}__av ${c}__tm" aria-hidden="true">${escapeHtml(initialsOf(name))}</span>`)
      const n = span('n', normal)
      const b = span('b', teamNames(config))
      const parts = (config.text.order === 'normal-first' ? [n, b] : [b, n]).filter(Boolean)
      return [`<span class="${c}__stk">${av}${members.join('')}</span>`, `<span>${parts.join(' ')}</span>`, icon].filter(Boolean)
    }
    case 'card': {
      const lines = [span('n', normal), span('b', bold), span('ro', config.text.role.trim())].filter(Boolean)
      return [av, `<span class="${c}__ct">${lines.join('')}</span>`, icon].filter(Boolean)
    }
    default:
      return [av, textHtml(c, config), icon].filter(Boolean)
  }
}

function textHtml(c: string, config: BadgeConfig): string {
  const normal = config.text.normal.trim()
  const bold = config.text.bold.trim()
  const n = normal ? `<span class="${c}__n">${escapeHtml(normal)}</span>` : ''
  const b = bold ? `<span class="${c}__b">${escapeHtml(bold)}</span>` : ''
  const parts = (config.text.order === 'normal-first' ? [n, b] : [b, n]).filter(Boolean)
  return `<span>${parts.join(' ')}</span>`
}

export type GeneratedBadge = {
  header: string
  html: string
  css: string
  js: string | null
  code: string
  /** What it was made from: the Flutter export rebuilds the badge from the settings. */
  config: BadgeConfig
  options: GenerateHtmlOptions
}

/** Pure: config → standalone HTML/CSS(/JS) snippet. What the preview shows is what gets copied. */
export function generateBadge(config: BadgeConfig, options: GenerateHtmlOptions = {}): GeneratedBadge {
  if (options.skipEntrance && config.motion.entrance !== 'none') {
    config = { ...config, motion: { ...config.motion, entrance: 'none' } }
  }
  const c = `sp-${config.id}`
  const avatar = resolveAvatar(config, options)
  const label = badgeText(config)
  const cssText = buildCss(config, avatar, options.previewScheme, options.hoverDemoAttr)
  const profile = usesProfile(config)
  const inner = innerHtml(c, config, avatar).filter(Boolean)
  const body = `\n    ${inner.join('\n    ')}\n  `
  const card = config.layout === 'card'

  let html: string
  let js: string | null = null
  if (profile) {
    // A button that opens a modal dialog with the profile.
    const attrs = [
      'type="button"',
      `class="${c}__${card ? 'lk' : 'pill'}"`,
      'aria-haspopup="dialog"',
      `aria-controls="${c}-dlg"`,
      `aria-label="${escapeHtml(label ? `${label}, open profile` : 'Open profile')}"`,
    ]
    const button = `<button ${attrs.join(' ')}>${body}</button>`
    const dialog = profileHtml(c, config, avatar)
    html = card
      ? `<div class="${c}">\n  <div class="${c}__pill">\n  ${button}\n  </div>\n${dialog}\n</div>`
      : `<div class="${c}">\n  ${button}\n${dialog}\n</div>`
    js = badgeRuntime(c)
  } else {
    const { url, newTab } = config.click.link
    const isMail = url.startsWith('mailto:')
    const blank = newTab && !isMail
    const attrs = [`class="${c}__${card ? 'lk' : 'pill'}"`, `href="${escapeHtml(url || '#')}"`]
    if (blank) attrs.push('target="_blank"', 'rel="noopener noreferrer"')
    // The stamp's text is drawn in an SVG: the link carries it as its name.
    if (blank || config.layout === 'stamp') attrs.push(`aria-label="${escapeHtml(blank ? `${label}, opens in a new tab` : label)}"`)
    const link = `<a ${attrs.join(' ')}>${body}</a>`
    html = card
      ? `<div class="${c}">\n  <div class="${c}__pill">\n  ${link}${socialsHtml(c, config)}\n  </div>\n</div>`
      : `<div class="${c}">\n  ${link}${socialsHtml(c, config)}\n</div>`
  }

  const header = `<!-- Stampit badge${options.editUrl ? ` · edit: ${commentSafe(options.editUrl)}` : ''} -->`
  const parts = [header, `<style>${cssText}</style>`, html]
  if (js) parts.push(`<script>${js}</script>`)
  const code = parts.join('\n') + '\n'
  return { header, html, css: cssText, js, code, config, options }
}

export function generateHtml(config: BadgeConfig, options: GenerateHtmlOptions = {}): string {
  return generateBadge(config, options).code
}
