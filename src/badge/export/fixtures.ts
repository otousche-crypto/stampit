import { applyPreset, enableAdaptToSite } from '../presets'
import { LAYOUTS, createDefaultConfig, mergeDeep, type BadgeConfig } from '../schema'

/** Fixed configs for snapshot tests (§13). Deterministic ids and dates. */
const base = () => createDefaultConfig({ id: 'test1234', updatedAt: '2026-10-22T12:00:00.000Z' })

const with_ = (partial: unknown, start: BadgeConfig = base()): BadgeConfig => mergeDeep(start, partial)

export const FIXTURES: Record<string, BadgeConfig> = {
  'link-initials': with_({
    text: { bold: 'Ada Lovelace' },
    click: { link: { url: 'https://ada.dev', newTab: true } },
  }),
  'link-socials': with_({
    text: { bold: 'Ada Lovelace' },
    click: { link: { url: 'https://ada.dev', newTab: true } },
    socials: { github: 'https://github.com/ada', x: 'https://x.com/ada', dribbble: 'not a url' },
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
  'profile-full': with_({
    text: { normal: 'Launched by', bold: 'Olivier Tousche', role: 'Product designer' },
    avatar: { source: 'url', url: '/olivier-avatar.png' },
    click: {
      mode: 'profile',
      link: { url: 'https://olivier.dev', newTab: true },
      profile: {
        sections: { newsletter: true, donate: true },
        newsletter: { url: 'https://olivier.substack.com', title: '', description: 'One email a month' },
        donate: { url: 'https://ko-fi.com/olivier', label: 'Buy me a coffee' },
        projects: [
          { id: 'p1', name: 'Stampit', url: 'https://stampit.app', description: 'Signature badges for side projects' },
          { id: 'p2', name: 'Décadi', url: 'not a url', description: '' },
          { id: 'p3', name: '', url: 'https://ignored.example', description: 'No name, not shown' },
        ],
      },
    },
    socials: { github: 'https://github.com/olivier', linkedin: 'https://www.linkedin.com/in/olivier' },
  }),
  'profile-minimal': with_(
    {
      text: { bold: 'Eight Links', size: 's' },
      avatar: { source: 'none' },
      shape: { radius: 0.3 },
      click: { mode: 'profile', link: { url: '', newTab: false } },
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

/** One fixture per badge model (§ Style), on the same link config. */
for (const layout of LAYOUTS) {
  if (layout === 'pill') continue
  FIXTURES[`layout-${layout}`] = with_({
    layout,
    text: { bold: 'Ada Lovelace' },
    team: ['Grace Hopper', 'Alan Turing', 'Linus Torvalds'],
    click: { link: { url: 'https://ada.dev', newTab: true } },
    socials: { github: 'https://github.com/ada' },
  })
}
