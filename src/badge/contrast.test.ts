import { describe, expect, it } from 'vitest'
import { bestOn, checkPalette, contrastRatio, formatRatio, relativeLuminance, parseHex } from './contrast'
import { LIGHT_PALETTE } from './schema'

describe('contrast', () => {
  it('matches WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5)
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2)
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2)
    expect(contrastRatio('#0000FF', '#FFFFFF')).toBeCloseTo(8.59, 2)
    expect(contrastRatio('#FF0000', '#FFFFFF')).toBeCloseTo(4.0, 2)
    expect(relativeLuminance(parseHex('#808080'))).toBeCloseTo(0.2159, 4)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#6E6E73', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#6E6E73'), 10)
  })

  it('composites translucent colours on the backdrop', () => {
    // White at 60 % on Glass (white 8 %) over near-black.
    const onDark = contrastRatio('#FFFFFF99', '#FFFFFF14', '#14141C')
    const onLight = contrastRatio('#FFFFFF99', '#FFFFFF14', '#F2F2F7')
    expect(onDark).toBeGreaterThan(4.5)
    expect(onLight).toBeLessThan(1.5)
    // Fully transparent background = the backdrop itself.
    expect(contrastRatio('#000000', '#00000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  it('picks the readable foreground', () => {
    expect(bestOn('#4F46E5')).toBe('#FFFFFF')
    expect(bestOn('#FFE066')).toBe('#000000')
  })

  it('formats without rounding up past the threshold', () => {
    expect(formatRatio(4.4999)).toBe('4.4:1')
    expect(formatRatio(2.86)).toBe('2.8:1')
  })

  it('flags only failing fields in scope', () => {
    const issues = checkPalette(LIGHT_PALETTE, '#F2F2F7', {
      hasNormalText: true,
      hasBoldText: true,
      hasIcon: true,
      hasBorder: false,
    })
    expect(issues).toEqual([])
    const withBorder = checkPalette(LIGHT_PALETTE, '#F2F2F7', {
      hasNormalText: true,
      hasBoldText: true,
      hasIcon: true,
      hasBorder: true,
    })
    expect(withBorder.map((i) => i.field)).toEqual(['border'])
  })
})
