import { applyPreset, enableAdaptToSite } from '../presets'
import { createDefaultConfig, mergeDeep, type BadgeConfig } from '../schema'

/** Fixed configs for snapshot tests (§13). Deterministic ids and dates. */
const base = () => createDefaultConfig({ id: 'test1234', updatedAt: '2026-10-22T12:00:00.000Z' })

const with_ = (partial: unknown, start: BadgeConfig = base()): BadgeConfig => mergeDeep(start, partial)

export const FIXTURES: Record<string, BadgeConfig> = {
  'link-initials': with_({
    text: { bold: 'Ada Lovelace' },
    click: { link: { url: 'https://ada.dev', newTab: true } },
  }),
  'link-photo': with_({
    text: { normal: 'Launched by', bold: 'Olivier Tousche', size: 'l', font: 'serif', boldWeight: 600 },
    avatar: { source: 'url', url: 'https://example.com/avatar.png' },
    shape: { radius: 0.5, borderWidth: 2, showIcon: false },
    click: { link: { url: 'https://example.com', newTab: false } },
  }),
  glass: with_(
    {
      text: { normal: '', bold: 'Glassworks', order: 'bold-first', size: 's', font: 'mono' },
      avatar: { source: 'none' },
      click: { link: { url: 'https://glass.example', newTab: true } },
    },
    applyPreset(base(), 'glass'),
  ),
  adaptive: with_(
    {
      text: { normal: 'Built by', bold: 'Grace Hopper' },
      click: { link: { url: 'mailto:grace@example.com', newTab: true } },
    },
    enableAdaptToSite(base()),
  ),
}
