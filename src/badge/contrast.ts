import type { Hex, Palette } from './schema'

export type Rgba = { r: number; g: number; b: number; a: number }

export function parseHex(hex: Hex): Rgba {
  const h = hex.replace('#', '')
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }
}

const to2 = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')

export function toHex({ r, g, b, a }: Rgba): Hex {
  const base = `#${to2(r)}${to2(g)}${to2(b)}`
  return (a >= 1 ? base : base + to2(a * 255)).toUpperCase()
}

/** Source-over composite of `fg` on an opaque `bg`. */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  }
}

function channel(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** WCAG 2.x relative luminance of an opaque colour. */
export function relativeLuminance({ r, g, b }: Rgba): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio, 1 to 21. Translucent colours are composited on `backdrop` first. */
export function contrastRatio(fg: Hex, bg: Hex, backdrop: Hex = '#FFFFFF'): number {
  const drop = parseHex(backdrop)
  const bgSolid = composite(parseHex(bg), { ...drop, a: 1 })
  const fgSolid = composite(parseHex(fg), bgSolid)
  const l1 = relativeLuminance(fgSolid)
  const l2 = relativeLuminance(bgSolid)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/** White or black, whichever reads better on `bg`. */
export function bestOn(bg: Hex, backdrop: Hex = '#FFFFFF'): '#FFFFFF' | '#000000' {
  return contrastRatio('#FFFFFF', bg, backdrop) >= contrastRatio('#000000', bg, backdrop) ? '#FFFFFF' : '#000000'
}

export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`
}

export type ContrastField = 'textNormal' | 'textBold' | 'icon' | 'border'

export type ContrastIssue = {
  field: ContrastField
  ratio: number
  required: number
}

export const CONTRAST_THRESHOLDS: Record<ContrastField, number> = {
  textNormal: 4.5,
  textBold: 4.5,
  icon: 3,
  border: 3,
}

export type ContrastScope = { hasNormalText: boolean; hasBoldText: boolean; hasIcon: boolean; hasBorder: boolean }

/** §6.3 — every colour of the palette checked against its background. Non-blocking. */
export function checkPalette(palette: Palette, backdrop: Hex, scope: ContrastScope): ContrastIssue[] {
  const fields: ContrastField[] = []
  if (scope.hasNormalText) fields.push('textNormal')
  if (scope.hasBoldText) fields.push('textBold')
  if (scope.hasIcon) fields.push('icon')
  if (scope.hasBorder) fields.push('border')
  const issues: ContrastIssue[] = []
  for (const field of fields) {
    const ratio = contrastRatio(palette[field], palette.background, backdrop)
    const required = CONTRAST_THRESHOLDS[field]
    if (ratio < required) issues.push({ field, ratio, required })
  }
  return issues
}
