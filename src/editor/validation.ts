import { isValidUrl } from '@/badge/channels'
import { SOCIALS, type BadgeConfig, type SocialNetwork } from '@/badge/schema'

export type EditorErrors = {
  text?: string
  linkUrl?: string
  /** Profile projects, by id. */
  project: Record<string, string>
  social: Partial<Record<SocialNetwork, string>>
}

/** Blocking problems: while any exists, export is disabled (§6.3, §6.5). */
export function validate(config: BadgeConfig): EditorErrors {
  const errors: EditorErrors = { project: {}, social: {} }
  if (!config.text.normal.trim() && !config.text.bold.trim()) {
    errors.text = 'Add at least one line of text.'
  }
  const url = config.click.link.url.trim()
  if (config.click.mode === 'link') {
    if (!url) errors.linkUrl = 'Add the address the badge links to.'
    else if (!isValidUrl(url)) errors.linkUrl = "This address doesn't look right."
  } else {
    // Profile: the portfolio is optional; a project needs a name, and a valid address if it has one.
    if (url && !isValidUrl(url)) errors.linkUrl = "This address doesn't look right."
    for (const project of config.click.profile.projects) {
      const projectUrl = project.url.trim()
      if (!project.name.trim()) errors.project[project.id] = 'Give this project a name.'
      else if (projectUrl && !isValidUrl(projectUrl)) errors.project[project.id] = "This address doesn't look right."
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
    errors.text || errors.linkUrl || Object.keys(errors.project).length || Object.keys(errors.social).length,
  )
}

/** One short sentence for the export column. */
export function blockingSummary(errors: EditorErrors): string | null {
  if (errors.text) return 'Add some text to your badge first.'
  if (errors.linkUrl) return 'Add a valid link first.'
  if (Object.keys(errors.project).length) return 'Fix the projects first.'
  if (Object.keys(errors.social).length) return 'Fix the social links first.'
  return null
}
