import type { BadgeConfig } from './schema'

/**
 * §9.3 — Olivier Tousche's badge, as on Décadi ("Crafted by" instead of "Par").
 * Link mode to LinkedIn; switch to Bubbles (LinkedIn first) once a second
 * channel is known.
 */
export const DEMO_CONFIG: BadgeConfig = {
  schemaVersion: 1,
  id: 'olivierT',
  updatedAt: '2026-10-22T12:00:00Z',
  preset: 'light',
  text: { normal: 'Crafted by', bold: 'John Doe', order: 'normal-first', boldWeight: 500, size: 'm', font: 'sans' },
  // Initials, so they follow the name roulette on the home page.
  avatar: { source: 'initials', initials: null, url: null, background: '#FF6B35' },
  theme: {
    // Light and dark palettes: the home page shows the one matching the site.
    adaptToSite: true,
    base: 'light',
    palettes: {
      light: { background: '#FFFFFF', border: '#0000000D', textNormal: '#6E6E73', textBold: '#000000', icon: '#6E6E73', blur: 0 },
      dark: { background: '#14141C', border: '#2E2E3A', textNormal: '#8A8A99', textBold: '#FFFFFF', icon: '#8A8A99', blur: 0 },
    },
  },
  shape: { radius: 1, borderWidth: 1, shadow: 'soft', showIcon: true, iconStyle: 'arrow' },
  motion: { entrance: 'none', repeat: 'none', hover: 'none' },
  click: {
    mode: 'link',
    link: { url: 'https://www.linkedin.com/in/olivier-tousche-a6160b122/', newTab: true },
    bubbles: { labels: 'icon', channels: [] },
  },
  socials: { github: '', linkedin: '', x: '', instagram: '', dribbble: '' },
}
