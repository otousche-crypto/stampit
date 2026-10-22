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
  'bubbles-2': with_({
    text: { normal: 'Launched by', bold: 'Olivier Tousche' },
    avatar: { source: 'url', url: '/olivier-avatar.png' },
    click: {
      mode: 'bubbles',
      link: { newTab: true },
      bubbles: {
        labels: 'icon',
        channels: [
          { id: 'c1', type: 'linkedin', url: 'https://www.linkedin.com/in/olivier' },
          { id: 'c2', type: 'website', url: 'https://olivier.dev' },
        ],
      },
    },
  }),
  'bubbles-8': with_(
    {
      text: { bold: 'Eight Links', size: 's' },
      shape: { radius: 0.3 },
      click: {
        mode: 'bubbles',
        link: { newTab: false },
        bubbles: {
          labels: 'icon-label',
          channels: [
            { id: 'a1', type: 'x', url: 'https://x.com/eight' },
            { id: 'a2', type: 'github', url: 'https://github.com/eight' },
            { id: 'a3', type: 'linkedin', url: 'https://linkedin.com/in/eight' },
            { id: 'a4', type: 'dribbble', url: 'https://dribbble.com/eight' },
            { id: 'a5', type: 'youtube', url: 'https://youtube.com/@eight' },
            { id: 'a6', type: 'bluesky', url: 'https://bsky.app/profile/eight' },
            { id: 'a7', type: 'email', url: 'mailto:eight@example.com' },
            { id: 'a8', type: 'custom', url: 'https://eight.example', label: 'Portfolio' },
          ],
        },
      },
    },
    applyPreset(base(), 'dark'),
  ),
  adaptive: with_(
    {
      text: { normal: 'Built by', bold: 'Grace Hopper' },
      click: { link: { url: 'mailto:grace@example.com', newTab: true } },
    },
    enableAdaptToSite(base()),
  ),
}
