import { describe, expect, it } from 'vitest'
import { applyPreset, brandPalette, enableAdaptToSite, matchPreset, presetPalette } from './presets'
import { createDefaultConfig, DARK_PALETTE, LIGHT_PALETTE } from './schema'

const base = () => createDefaultConfig({ id: 'p', updatedAt: 'x' })

describe('presets', () => {
  it('writes the preset into the target palette, with its shadow', () => {
    const dark = applyPreset(base(), 'dark')
    expect(dark.theme.palettes.light).toEqual(DARK_PALETTE)
    expect(dark.shape.shadow).toBe('none')
    expect(dark.preset).toBe('dark')
    expect(applyPreset(base(), 'glass', 'dark').theme.palettes.dark.blur).toBe(12)
  })

  it('derives Brand from the brand colour', () => {
    expect(brandPalette('#4F46E5')).toEqual({
      background: '#4F46E5',
      border: '#00000000',
      textNormal: '#FFFFFFB3',
      textBold: '#FFFFFF',
      icon: '#FFFFFFB3',
      blur: 0,
    })
    expect(brandPalette('#FFE066').textBold).toBe('#000000')
  })

  it('recognises preset palettes', () => {
    expect(matchPreset(LIGHT_PALETTE)).toBe('light')
    expect(matchPreset(presetPalette('glass'))).toBe('glass')
    expect(matchPreset(brandPalette('#123456'), '#123456')).toBe('brand')
    expect(matchPreset({ ...LIGHT_PALETTE, textBold: '#111111' })).toBeNull()
  })

  it('enables Adapt to site theme with the opposite palette', () => {
    const fromLight = enableAdaptToSite(base())
    expect(fromLight.theme).toMatchObject({ adaptToSite: true, base: 'light' })
    expect(fromLight.theme.palettes.dark).toEqual(DARK_PALETTE)

    const fromDark = enableAdaptToSite(applyPreset(base(), 'dark'))
    expect(fromDark.theme.base).toBe('dark')
    expect(fromDark.theme.palettes.light).toEqual(LIGHT_PALETTE)
    expect(fromDark.theme.palettes.dark).toEqual(DARK_PALETTE)

    const fromGlass = enableAdaptToSite(applyPreset(base(), 'glass'))
    expect(fromGlass.theme.palettes.dark.blur).toBe(12)
    expect(fromGlass.theme.palettes.light).toEqual(LIGHT_PALETTE)
  })
})
