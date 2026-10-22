import type { ChannelType } from './schema'

/**
 * Channel icons on a 24×24 grid. Brand marks come from Simple Icons (CC0;
 * LinkedIn from its official glyph), paths rounded to 1 decimal to keep the
 * export light. Generic ones (website, email, custom) are Lucide strokes.
 */
export type ChannelIcon = { kind: 'fill'; d: string } | { kind: 'stroke'; d: string }

export type ChannelDef = {
  type: ChannelType
  label: string
  icon: ChannelIcon
  placeholder: string
  /** Hostnames that belong to the channel; empty = anything goes. */
  domains: string[]
}

const fill = (d: string): ChannelIcon => ({ kind: 'fill', d })
const stroke = (d: string): ChannelIcon => ({ kind: 'stroke', d })

export const CHANNELS: Record<ChannelType, ChannelDef> = {
  x: { type: 'x', label: 'X', icon: fill('M14.2 10.2 23 0h-2.1l-7.6 8.8L7.3 0H.3l9.2 13.3L.3 24H2.3l8-9.3L16.7 24h7zm-2.8 3.3-.9-1.3L3.1 1.6h3.2l6 8.5.9 1.3 7.8 11.1h-3.2z'), placeholder: 'x.com/username', domains: ['x.com', 'twitter.com'] },
  linkedin: { type: 'linkedin', label: 'LinkedIn', icon: fill('M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.9-3-1.9 0-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h0c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4c-1.1 0-2.1-.9-2.1-2.1 0-1.1.9-2.1 2.1-2.1 1.1 0 2.1.9 2.1 2.1 0 1.1-.9 2.1-2.1 2.1zm1.8 13H3.6V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.5C0 23.2.8 24 1.8 24h20.5C23.2 24 24 23.2 24 22.3V1.7C24 .8 23.2 0 22.2 0h0z'), placeholder: 'linkedin.com/in/username', domains: ['linkedin.com', 'lnkd.in'] },
  website: { type: 'website', label: 'Website', icon: stroke('M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'), placeholder: 'yoursite.com', domains: [] },
  instagram: { type: 'instagram', label: 'Instagram', icon: fill('M7 .1c-1.3.1-2.1.3-2.9.6-.8.3-1.5.7-2.1 1.4-.7.7-1.1 1.3-1.4 2.1-.3.8-.5 1.6-.6 2.9-.1 1.3-.1 1.7-.1 4.9 0 3.3 0 3.7.1 4.9.1 1.3.3 2.1.6 2.9.3.8.7 1.5 1.4 2.1.7.7 1.3 1.1 2.1 1.4.8.3 1.6.5 2.9.6 1.3.1 1.7.1 4.9.1 3.3 0 3.7 0 4.9-.1 1.3-.1 2.1-.3 2.9-.6.8-.3 1.5-.7 2.1-1.4.7-.7 1.1-1.3 1.4-2.1.3-.8.5-1.6.6-2.9.1-1.3.1-1.7.1-4.9 0-3.3 0-3.7-.1-4.9-.1-1.3-.3-2.1-.6-2.9-.3-.8-.7-1.5-1.4-2.1C21.3 1.3 20.6.9 19.8.6 19.1.3 18.2.1 16.9.1 15.6 0 15.2 0 12 0 8.7 0 8.3 0 7 .1m.1 21.7c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.8 0-3.2 0-3.6.1-4.8.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.8-.1 3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1-3.2 0-3.6 0-4.8-.1M17 5.6A1.4 1.4 0 1 0 18.4 4.1a1.4 1.4 0 0 0-1.4 1.4M5.8 12c0 3.4 2.8 6.2 6.2 6.1 3.4 0 6.2-2.8 6.2-6.2 0-3.4-2.8-6.2-6.2-6.1-3.4 0-6.2 2.8-6.1 6.2M8 12a4 4 0 1 1 4 4A4 4 0 0 1 8 12'), placeholder: 'instagram.com/username', domains: ['instagram.com', 'instagr.am'] },
  github: { type: 'github', label: 'GitHub', icon: fill('M12 .3c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6 0-.3 0-1 0-2-3.3.7-4-1.6-4-1.6C4.4 18.1 3.6 17.7 3.6 17.7c-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4 1 0 2 .1 3 .4 2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2 0 1.6 0 2.9 0 3.3 0 .3.2.7.8.6C20.6 22.1 24 17.6 24 12.3c0-6.6-5.4-12-12-12'), placeholder: 'github.com/username', domains: ['github.com'] },
  dribbble: { type: 'dribbble', label: 'Dribbble', icon: fill('M12 24C5.4 24 0 18.6 0 12S5.4 0 12 0s12 5.4 12 12-5.4 12-12 12zm10.1-10.4c-.3-.1-3.2-1-6.4-.4 1.3 3.7 1.9 6.7 2 7.3 2.3-1.6 3.9-4 4.4-6.9zm-6.1 7.8c-.2-.9-.7-4-2.2-7.8l-.1 0c-5.8 2-7.9 6-8 6.4 1.7 1.4 3.9 2.2 6.3 2.2 1.4 0 2.8-.3 4-.8zm-11.6-2.6c.2-.4 3-5.1 8.3-6.8.1 0 .3-.1.4-.1-.3-.6-.5-1.2-.8-1.7C7.2 11.8 2.2 11.7 1.8 11.7l0 .3c0 2.6 1 5 2.6 6.9zm-2.4-9c.5 0 4.7 0 9.5-1.2-1.7-3-3.5-5.6-3.8-5.9-2.9 1.4-5 4-5.7 7.2zM9.6 2.1c.3.4 2.1 2.9 3.8 6 3.6-1.4 5.2-3.4 5.4-3.7-1.8-1.6-4.2-2.6-6.8-2.6-.8 0-1.6.1-2.4.3zm10.3 3.5c-.2.3-1.9 2.5-5.7 4 .2.5.5 1 .7 1.5.1.2.2.4.2.5 3.4-.4 6.8.3 7.1.3 0-2.4-.9-4.6-2.3-6.4z'), placeholder: 'dribbble.com/username', domains: ['dribbble.com'] },
  behance: { type: 'behance', label: 'Behance', icon: fill('M17 16.9a2.6 2.6 0 0 0 1.9.7 2.5 2.5 0 0 0 1.5-.5c.4-.2.6-.6.8-1h2.6a5.1 5.1 0 0 1-1.9 2.9 5.3 5.3 0 0 1-3.1.9 5.8 5.8 0 0 1-2.3-.4 4.9 4.9 0 0 1-1.7-1.2 5.7 5.7 0 0 1-1.1-1.9 7.1 7.1 0 0 1-.4-2.4c0-.8.1-1.6.4-2.3a5.3 5.3 0 0 1 5.1-3.6 4.9 4.9 0 0 1 2.4.6c.7.4 1.2.9 1.7 1.5a6.2 6.2 0 0 1 .9 2.1c.2.8.3 1.7.2 2.5h-7.7c-.1.8.2 1.6.7 2.2ZM6.9 4.1a8.1 8.1 0 0 1 1.9.2 4.3 4.3 0 0 1 1.5.6c.4.3.7.7 1 1.2.2.6.4 1.2.3 1.8a3.5 3.5 0 0 1-.5 2 3.7 3.7 0 0 1-1.5 1.3 3.6 3.6 0 0 1 2 1.4c.5.7.7 1.6.7 2.5a4.6 4.6 0 0 1-.4 2 3.9 3.9 0 0 1-1.2 1.4 5.1 5.1 0 0 1-1.7.8 7.1 7.1 0 0 1-1.9.3H0V4.1h6.9Zm-.2 12.9c.3 0 .6 0 .9-.1a2.2 2.2 0 0 0 .8-.3c.2-.2.4-.4.5-.6.1-.3.2-.7.2-1a2.1 2.1 0 0 0-.6-1.7 2.6 2.6 0 0 0-1.7-.5h-3.5v4.3h3.5Zm13.6-6a2.1 2.1 0 0 0-1.7-.6 2.3 2.3 0 0 0-1.2.3 2.5 2.5 0 0 0-.7.6 2.4 2.4 0 0 0-.4.8c-.1.2-.1.5-.1.7h4.8a3.2 3.2 0 0 0-.7-1.8l0 0Zm-13.8-.6a2.3 2.3 0 0 0 1.4-.4c.4-.4.6-.9.6-1.4a1.9 1.9 0 0 0-.2-.9 1.3 1.3 0 0 0-.5-.5 1.9 1.9 0 0 0-.7-.3 4 4 0 0 0-.8-.1H3.2v3.6h3.3v0ZM21.6 5.1h-6v1.5h6V5.1Z'), placeholder: 'behance.net/username', domains: ['behance.net'] },
  email: { type: 'email', label: 'Email', icon: stroke('M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm18 3-10 6L2 7'), placeholder: 'you@example.com', domains: [] },
  threads: { type: 'threads', label: 'Threads', icon: fill('M18.3 11.1c0-3.5-1.9-5.6-5.1-5.6-2.1 0-3.9 1-4.9 2.5l2.1 1.4c.5-.8 1.3-1.5 2.6-1.5 1.5 0 2.3.9 2.5 2.4a15 15 0 0 0-2.2-.2c-4.1 0-6.1 1.9-6.1 4.3s1.9 4 4.8 4c3.1 0 5-2.1 5.8-4.7.8.4 1.3 1.2 1.3 2.5 0 3.4-3.9 5.2-7.2 5.2-4.9 0-8.1-3.2-8.1-8.4 0-6.4 4.2-10.5 9.9-10.5 3.8 0 5.7 1.7 7 3.9l2.1-1.5C21.4 2.1 18.3 0 13.7 0 6.2 0 1.2 5.3 1.2 12.9c0 7 5 11.1 10.9 11.1 4.9 0 9.8-2.8 9.8-7.7 0-2.5-1.5-4.2-3.6-5.2m-6.3 4.9c-1.1 0-2-.5-2-1.5 0-1.5 1.8-1.9 3.6-1.9.7 0 1.3 0 1.9.2-.4 1.9-1.7 3.2-3.5 3.2Z'), placeholder: 'threads.net/@username', domains: ['threads.net', 'threads.com'] },
  bluesky: { type: 'bluesky', label: 'Bluesky', icon: fill('M5.2 2.9C8 4.9 10.9 9.1 12 11.4c1.1-2.2 4-6.4 6.8-8.5C20.8 1.4 24 .2 24 3.9c0 .7-.4 6.2-.7 7-.9 3.1-4 3.8-6.8 3.4 4.9.8 6.1 3.6 3.4 6.3-5.1 5.2-7.3-1.3-7.8-3-.1-.3-.2-.4-.2-.3 0-.1 0 0-.2.3-.6 1.7-2.8 8.2-7.8 3-2.7-2.7-1.4-5.5 3.4-6.3-2.8.5-5.9-.3-6.8-3.4C.4 10 0 4.6 0 3.9c0-3.7 3.2-2.5 5.2-1'), placeholder: 'bsky.app/profile/you.bsky.social', domains: ['bsky.app', 'bsky.social'] },
  youtube: { type: 'youtube', label: 'YouTube', icon: fill('M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z'), placeholder: 'youtube.com/@channel', domains: ['youtube.com', 'youtu.be'] },
  custom: { type: 'custom', label: 'Custom', icon: stroke('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'), placeholder: 'example.com', domains: [] },
}

/** Combobox order (§6.3). */
export const CHANNEL_ORDER: ChannelType[] = [
  'x', 'linkedin', 'website', 'instagram', 'github', 'dribbble', 'behance', 'email', 'threads', 'bluesky', 'youtube', 'custom',
]

export const MIN_CHANNELS = 2
export const MAX_CHANNELS = 8

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Add `https://` when missing; email addresses become `mailto:`. */
export function normalizeUrl(raw: string, type: ChannelType = 'website'): string {
  const v = raw.trim()
  if (!v) return ''
  if (type === 'email') {
    const address = v.replace(/^mailto:/i, '')
    return `mailto:${address}`
  }
  if (/^mailto:/i.test(v)) return v
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return v
  return `https://${v.replace(/^\/+/, '')}`
}

/** Valid http(s) URL with a dotted host, or a valid mailto. */
export function isValidUrl(url: string, type: ChannelType = 'website'): boolean {
  if (!url) return false
  if (type === 'email' || url.startsWith('mailto:')) return EMAIL_RE.test(url.replace(/^mailto:/i, ''))
  try {
    const u = new URL(url)
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.')
  } catch {
    return false
  }
}

/** Non-blocking: does the URL belong to the channel's domain? */
export function domainMatches(url: string, type: ChannelType): boolean {
  const domains = CHANNELS[type].domains
  if (domains.length === 0) return true
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
    return domains.some((d) => host === d || host.endsWith(`.${d}`))
  } catch {
    return true
  }
}

export function channelLabel(channel: { type: ChannelType; label?: string }): string {
  return channel.type === 'custom' ? channel.label?.trim() || 'Link' : CHANNELS[channel.type].label
}
