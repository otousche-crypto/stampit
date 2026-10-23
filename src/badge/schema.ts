import { z } from 'zod'
import { customAlphabet } from 'nanoid'

/** "#RRGGBB" or "#RRGGBBAA", stored upper-case. */
export const hexSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)
  .transform((v) => v.toUpperCase())

export const paletteSchema = z.object({
  background: hexSchema,
  border: hexSchema,
  textNormal: hexSchema,
  textBold: hexSchema,
  icon: hexSchema,
  blur: z.union([z.literal(0), z.literal(12)]),
})

export const CHANNEL_TYPES = [
  'x',
  'linkedin',
  'website',
  'instagram',
  'github',
  'dribbble',
  'behance',
  'email',
  'threads',
  'bluesky',
  'youtube',
  'custom',
] as const

/** Badge animations (editor "Animation" section). */
export const ENTRANCES = ['none', 'shake', 'bump', 'shine'] as const
export const HOVERS = ['none', 'grow', 'lift', 'pulse', 'shake'] as const

/** Social links shown as round icons next to the badge (one field per network). */
export const SOCIALS = ['github', 'linkedin', 'x', 'instagram', 'dribbble'] as const

export const ICON_STYLES = ['arrow', 'triangle', 'link'] as const

/** Badge models (editor "Style"). Same config, a different rendering. */
export const LAYOUTS = ['pill', 'stamp', 'split', 'card', 'team'] as const

export const channelSchema = z.object({
  id: z.string().min(1).max(32),
  type: z.enum(CHANNEL_TYPES),
  url: z.string().max(2048),
  label: z.string().max(20).optional(),
})

/** Ids end up in class names: keep them to safe characters. */
const idSchema = z.string().regex(/^[A-Za-z0-9]{1,32}$/)

export const badgeConfigSchema = z.object({
  schemaVersion: z.literal(1),
  id: idSchema,
  updatedAt: z.string(),

  layout: z.enum(LAYOUTS).catch('pill'),

  preset: z.enum(['light', 'dark', 'glass', 'brand', 'custom']),
  brandColor: hexSchema.optional(),

  text: z.object({
    normal: z.string().max(24),
    bold: z.string().max(32),
    order: z.enum(['normal-first', 'bold-first']),
    boldWeight: z.union([z.literal(400), z.literal(500), z.literal(600)]),
    size: z.enum(['s', 'm', 'l']),
    font: z.enum(['sans', 'serif', 'mono']),
    /** Card: a line under the name. */
    role: z.string().max(40),
  }),

  /** Team: the other people, after the bold text. */
  team: z.array(z.string().max(32)).max(5),

  avatar: z.object({
    source: z.enum(['none', 'initials', 'upload', 'url']),
    initials: z.string().max(2).nullable(),
    url: z.string().max(2048).nullable(),
    background: hexSchema,
  }),

  theme: z.object({
    adaptToSite: z.boolean(),
    base: z.enum(['light', 'dark']),
    palettes: z.object({ light: paletteSchema, dark: paletteSchema }),
  }),

  shape: z.object({
    radius: z.number().min(0).max(1),
    borderWidth: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    shadow: z.enum(['none', 'soft']),
    showIcon: z.boolean(),
    /** Link mode's icon when `showIcon` is on. Bubbles mode always uses "+". */
    iconStyle: z.enum(ICON_STYLES),
  }),

  motion: z.object({
    // Retired values (fade, grow…) from older links fall back to none.
    entrance: z.enum(ENTRANCES).catch('none'),
    /** Same effects, replayed every 5 s. */
    repeat: z.enum(ENTRANCES).catch('none'),
    hover: z.enum(HOVERS),
  }),

  click: z.object({
    mode: z.enum(['link', 'bubbles']),
    link: z.object({ url: z.string().max(2048), newTab: z.boolean() }),
    bubbles: z.object({
      labels: z.enum(['icon', 'icon-label']),
      channels: z.array(channelSchema).max(8),
    }),
  }),

  socials: z.object({
    github: z.string().max(2048),
    linkedin: z.string().max(2048),
    x: z.string().max(2048),
    instagram: z.string().max(2048),
    dribbble: z.string().max(2048),
  }),
})

export type Hex = string
export type Palette = z.infer<typeof paletteSchema>
export type ChannelType = (typeof CHANNEL_TYPES)[number]
export type Channel = z.infer<typeof channelSchema>
export type BadgeConfig = z.infer<typeof badgeConfigSchema>
export type PaletteKey = 'light' | 'dark'
export type PresetName = BadgeConfig['preset']
export type BadgeSize = BadgeConfig['text']['size']
export type SocialNetwork = (typeof SOCIALS)[number]
export type IconStyle = (typeof ICON_STYLES)[number]
export type Entrance = (typeof ENTRANCES)[number]
export type HoverEffect = (typeof HOVERS)[number]
export type Layout = (typeof LAYOUTS)[number]

export const CURRENT_SCHEMA_VERSION = 1

export const newBadgeId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)
export const newChannelId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

export const LIGHT_PALETTE: Palette = {
  background: '#FFFFFF',
  border: '#0000000D',
  textNormal: '#6E6E73',
  textBold: '#000000',
  icon: '#6E6E73',
  blur: 0,
}

export const DARK_PALETTE: Palette = {
  background: '#14141C',
  border: '#2E2E3A',
  textNormal: '#8A8A99',
  textBold: '#FFFFFF',
  icon: '#8A8A99',
  blur: 0,
}

export const DEFAULT_BRAND_COLOR = '#4F46E5'
export const DEFAULT_AVATAR_BACKGROUND = '#FF6B35'

/** §9.2 — the Décadi badge, with placeholder text. `id` and `updatedAt` are fresh each call. */
export function createDefaultConfig(overrides?: { id?: string; updatedAt?: string }): BadgeConfig {
  return {
    schemaVersion: 1,
    id: overrides?.id ?? newBadgeId(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
    layout: 'pill',
    preset: 'light',
    text: {
      normal: 'Crafted by',
      bold: 'Your Name',
      order: 'normal-first',
      boldWeight: 500,
      size: 'm',
      font: 'sans',
      role: 'Product designer',
    },
    team: ['Camille Bernard', 'Lucas Fontaine'],
    avatar: { source: 'initials', initials: null, url: null, background: DEFAULT_AVATAR_BACKGROUND },
    theme: {
      adaptToSite: false,
      base: 'light',
      palettes: { light: { ...LIGHT_PALETTE }, dark: { ...DARK_PALETTE } },
    },
    shape: { radius: 1, borderWidth: 1, shadow: 'soft', showIcon: true, iconStyle: 'arrow' },
    motion: { entrance: 'none', repeat: 'none', hover: 'none' },
    click: {
      mode: 'link',
      link: { url: '', newTab: true },
      bubbles: { labels: 'icon', channels: [] },
    },
    socials: { github: '', linkedin: '', x: '', instagram: '', dribbble: '' },
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Deep-merge `partial` onto `base`. Arrays and primitives in `partial` replace. */
export function mergeDeep<T>(base: T, partial: unknown): T {
  if (!isObject(base) || !isObject(partial)) return (partial === undefined ? base : partial) as T
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined) continue
    out[key] = isObject(out[key]) && isObject(value) ? mergeDeep(out[key], value) : value
  }
  return out as T
}

/**
 * Bring an older stored config up to the current schema. V0 only knows
 * version 1; unknown or future versions are rejected so the caller falls back.
 */
export function migrate(raw: unknown): unknown {
  if (!isObject(raw)) return raw
  const version = raw.schemaVersion ?? CURRENT_SCHEMA_VERSION
  if (version !== CURRENT_SCHEMA_VERSION) return { ...raw, schemaVersion: version }
  return { ...raw, schemaVersion: CURRENT_SCHEMA_VERSION }
}

export type ParseResult = { ok: true; config: BadgeConfig } | { ok: false; error: string }

/** Merge with defaults → migrate → validate. */
export function parseConfig(raw: unknown, defaults: BadgeConfig = createDefaultConfig()): ParseResult {
  if (!isObject(raw)) return { ok: false, error: 'Not an object' }
  const migrated = migrate(raw)
  const merged = mergeDeep(defaults, migrated)
  const result = badgeConfigSchema.safeParse(merged)
  if (!result.success) return { ok: false, error: result.error.message }
  return { ok: true, config: result.data }
}
