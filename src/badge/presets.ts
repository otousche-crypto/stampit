import { bestOn, parseHex, relativeLuminance } from './contrast'
import {
  DARK_PALETTE,
  DEFAULT_BRAND_COLOR,
  LIGHT_PALETTE,
  type BadgeConfig,
  type Hex,
  type Palette,
  type PaletteKey,
  type PresetName,
} from './schema'

export type FixedPreset = Exclude<PresetName, 'custom'>

export const PRESET_LABELS: Record<FixedPreset, string> = {
  light: 'Light',
  dark: 'Dark',
  glass: 'Glass',
  brand: 'Brand',
}

export const GLASS_PALETTE: Palette = {
  background: '#FFFFFF14',
  border: '#FFFFFF29',
  textNormal: '#FFFFFF99',
  textBold: '#FFFFFF',
  icon: '#FFFFFF99',
  blur: 12,
}

/** 70 % opacity, as an 8-digit hex suffix. */
const ALPHA_70 = 'B3'

/** Brand: background = brand colour; white or black text, normal text and icon at 70 %. */
export function brandPalette(brand: Hex): Palette {
  const solid = brand.slice(0, 7).toUpperCase()
  const fg = bestOn(solid)
  return {
    background: solid,
    border: '#00000000',
    textNormal: fg + ALPHA_70,
    textBold: fg,
    icon: fg + ALPHA_70,
    blur: 0,
  }
}

export function presetPalette(preset: FixedPreset, brandColor: Hex = DEFAULT_BRAND_COLOR): Palette {
  switch (preset) {
    case 'light':
      return { ...LIGHT_PALETTE }
    case 'dark':
      return { ...DARK_PALETTE }
    case 'glass':
      return { ...GLASS_PALETTE }
    case 'brand':
      return brandPalette(brandColor)
  }
}

export function presetShadow(preset: FixedPreset): BadgeConfig['shape']['shadow'] {
  return preset === 'light' || preset === 'brand' ? 'soft' : 'none'
}

/** Palette edited by the controls: the theme tab when adapting, `base` otherwise. */
export function activePaletteKey(config: BadgeConfig, editing?: PaletteKey): PaletteKey {
  return config.theme.adaptToSite && editing ? editing : config.theme.base
}

/** Choosing a preset overwrites the colours of the target palette (and the shadow). */
export function applyPreset(
  config: BadgeConfig,
  preset: FixedPreset,
  target: PaletteKey = config.theme.base,
  brandColor: Hex = config.brandColor ?? DEFAULT_BRAND_COLOR,
): BadgeConfig {
  return {
    ...config,
    preset,
    brandColor: preset === 'brand' ? brandColor : config.brandColor,
    theme: {
      ...config.theme,
      palettes: { ...config.theme.palettes, [target]: presetPalette(preset, brandColor) },
    },
    shape: { ...config.shape, shadow: presetShadow(preset) },
  }
}

/** Is the palette dark-looking? Used to pick the opposite palette. */
export function isDarkPalette(palette: Palette): boolean {
  return relativeLuminance(parseHex(palette.background)) < 0.2
}

/** Which fixed preset produced this palette, if any (drives the Preset radio). */
export function matchPreset(palette: Palette, brandColor?: Hex): FixedPreset | null {
  const same = (a: Palette, b: Palette) =>
    a.background === b.background &&
    a.border === b.border &&
    a.textNormal === b.textNormal &&
    a.textBold === b.textBold &&
    a.icon === b.icon &&
    a.blur === b.blur
  for (const preset of ['light', 'dark', 'glass'] as const) {
    if (same(palette, presetPalette(preset))) return preset
  }
  if (brandColor && same(palette, brandPalette(brandColor))) return 'brand'
  return null
}

/**
 * First activation of "Adapt to site theme": the active palette keeps its
 * colours, the other one gets the opposite preset (Light ↔ Dark; Glass and
 * Brand → Light).
 */
export function enableAdaptToSite(config: BadgeConfig): BadgeConfig {
  const base = config.theme.base
  const active = config.theme.palettes[base]
  let activeKey: PaletteKey = base
  let other: Palette
  switch (config.preset) {
    case 'light':
      activeKey = 'light'
      other = presetPalette('dark')
      break
    case 'dark':
      activeKey = 'dark'
      other = presetPalette('light')
      break
    case 'glass':
    case 'brand':
      activeKey = 'dark'
      other = presetPalette('light')
      break
    case 'custom':
      activeKey = isDarkPalette(active) ? 'dark' : 'light'
      other = presetPalette(activeKey === 'dark' ? 'light' : 'dark')
      break
  }
  const palettes =
    activeKey === 'light' ? { light: active, dark: other } : { light: other, dark: active }
  return { ...config, theme: { adaptToSite: true, base: activeKey, palettes } }
}
