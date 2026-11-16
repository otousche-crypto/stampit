/**
 * Newsletter services, recognized from the address pasted in the editor.
 * Those that take a plain form post from any site get an email field and a
 * Subscribe button right in the modal (the service then shows its own
 * confirmation page in a new tab); the others keep a link to their page.
 */

export type NewsletterProvider = 'buttondown' | 'kit' | 'mailchimp' | 'substack' | 'beehiiv' | 'mailerlite'

export const NEWSLETTER_PROVIDER_LABELS: Record<NewsletterProvider, string> = {
  buttondown: 'Buttondown',
  kit: 'Kit',
  mailchimp: 'Mailchimp',
  substack: 'Substack',
  beehiiv: 'beehiiv',
  mailerlite: 'MailerLite',
}

export type NewsletterTarget =
  /** Subscribe in the modal: post `field` to `action`. */
  | { kind: 'form'; provider: NewsletterProvider; action: string; field: string }
  /** A link to the newsletter's page (known service or not). */
  | { kind: 'link'; provider: NewsletterProvider | null }

const hostIs = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`)

/** What the modal can do with this address. Expects a valid http(s) URL. */
export function newsletterTarget(address: string): NewsletterTarget {
  let url: URL
  try {
    url = new URL(address)
  } catch {
    return { kind: 'link', provider: null }
  }
  const host = url.hostname.toLowerCase()
  const path = url.pathname.split('/').filter(Boolean)

  // buttondown.com/{username}, or its own embed-subscribe address.
  if (hostIs(host, 'buttondown.com') || hostIs(host, 'buttondown.email')) {
    const user = path[0] === 'api' ? path[3] : path[0]
    if (user && /^[A-Za-z0-9_-]+$/.test(user)) {
      return { kind: 'form', provider: 'buttondown', action: `https://buttondown.com/api/emails/embed-subscribe/${user}`, field: 'email' }
    }
    return { kind: 'link', provider: 'buttondown' }
  }

  // Kit (ConvertKit): the form's address, app.kit.com/forms/{id}/subscriptions.
  if (hostIs(host, 'kit.com') || hostIs(host, 'convertkit.com')) {
    const i = path.indexOf('forms')
    const id = i >= 0 ? path[i + 1] : undefined
    if (id && /^\d+$/.test(id)) {
      return { kind: 'form', provider: 'kit', action: `https://app.kit.com/forms/${id}/subscriptions`, field: 'email_address' }
    }
    return { kind: 'link', provider: 'kit' }
  }

  // Mailchimp: the embedded form's address, {dc}.list-manage.com/subscribe/post?u=…&id=….
  if (hostIs(host, 'list-manage.com')) {
    const u = url.searchParams.get('u')
    const id = url.searchParams.get('id')
    if (u && id && path[0] === 'subscribe') {
      const action = `https://${host}/subscribe/post?u=${encodeURIComponent(u)}&id=${encodeURIComponent(id)}`
      return { kind: 'form', provider: 'mailchimp', action, field: 'EMAIL' }
    }
    return { kind: 'link', provider: 'mailchimp' }
  }

  // No form post from other sites: a link to their page.
  if (hostIs(host, 'substack.com')) return { kind: 'link', provider: 'substack' }
  if (hostIs(host, 'beehiiv.com')) return { kind: 'link', provider: 'beehiiv' }
  if (hostIs(host, 'mailerlite.com') || hostIs(host, 'mailerpage.com')) return { kind: 'link', provider: 'mailerlite' }
  return { kind: 'link', provider: null }
}
