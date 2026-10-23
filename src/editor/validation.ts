import { isValidUrl, MIN_CHANNELS } from '@/badge/channels'
import { SOCIALS, type BadgeConfig, type SocialNetwork } from '@/badge/schema'

export type EditorErrors = {
  text?: string
  linkUrl?: string
  channels?: string
  channel: Record<string, string>
  social: Partial<Record<SocialNetwork, string>>
}

/** Blocking problems: while any exists, export is disabled (§6.3, §6.5). */
export function validate(config: BadgeConfig): EditorErrors {
  const errors: EditorErrors = { channel: {}, social: {} }
  if (!config.text.normal.trim() && !config.text.bold.trim()) {
    errors.text = 'Add at least one line of text.'
  }
  if (config.click.mode === 'link') {
    const url = config.click.link.url.trim()
    if (!url) errors.linkUrl = 'Add the address the badge links to.'
    else if (!isValidUrl(url)) errors.linkUrl = "This address doesn't look right."
  } else {
    const channels = config.click.bubbles.channels
    if (channels.length < MIN_CHANNELS) errors.channels = 'Add at least two channels, or switch to Link mode.'
    for (const ch of channels) {
      if (ch.type === 'custom' && !ch.label?.trim()) errors.channel[ch.id] = 'Give this link a label.'
      else if (!ch.url.trim()) errors.channel[ch.id] = ch.type === 'email' ? 'Add an email address.' : 'Add a link.'
      else if (!isValidUrl(ch.url, ch.type)) {
        errors.channel[ch.id] = ch.type === 'email' ? "This email doesn't look right." : "This address doesn't look right."
      }
    }
  }
  for (const network of SOCIALS) {
    const url = config.socials[network].trim()
    if (url && !isValidUrl(url)) errors.social[network] = "This address doesn't look right."
  }
  return errors
}

export function hasBlockingErrors(errors: EditorErrors): boolean {
  return Boolean(
    errors.text || errors.linkUrl || errors.channels || Object.keys(errors.channel).length || Object.keys(errors.social).length,
  )
}

/** One short sentence for the export column. */
export function blockingSummary(errors: EditorErrors): string | null {
  if (errors.text) return 'Add some text to your badge first.'
  if (errors.linkUrl) return 'Add a valid link first.'
  if (errors.channels) return 'Add at least two channels first.'
  if (Object.keys(errors.channel).length) return 'Fix the channel links first.'
  if (Object.keys(errors.social).length) return 'Fix the social links first.'
  return null
}
