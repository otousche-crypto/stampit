import { describe, expect, it } from 'vitest'
import { newsletterTarget } from './newsletter'

describe('newsletter services', () => {
  it('posts to the services that take sign-ups from any site', () => {
    expect(newsletterTarget('https://buttondown.com/olivier')).toEqual({
      kind: 'form',
      provider: 'buttondown',
      action: 'https://buttondown.com/api/emails/embed-subscribe/olivier',
      field: 'email',
    })
    expect(newsletterTarget('https://app.kit.com/forms/123456/subscriptions')).toMatchObject({
      kind: 'form',
      provider: 'kit',
      action: 'https://app.kit.com/forms/123456/subscriptions',
      field: 'email_address',
    })
    expect(newsletterTarget('https://olivier.us21.list-manage.com/subscribe/post?u=abc&id=def')).toMatchObject({
      kind: 'form',
      provider: 'mailchimp',
      action: 'https://olivier.us21.list-manage.com/subscribe/post?u=abc&id=def',
      field: 'EMAIL',
    })
  })

  it('links to the page for the others, and when the address is not a form', () => {
    expect(newsletterTarget('https://olivier.substack.com')).toEqual({ kind: 'link', provider: 'substack' })
    expect(newsletterTarget('https://olivier.beehiiv.com/subscribe')).toEqual({ kind: 'link', provider: 'beehiiv' })
    expect(newsletterTarget('https://olivier.kit.com/newsletter')).toEqual({ kind: 'link', provider: 'kit' })
    expect(newsletterTarget('https://olivier.dev/newsletter')).toEqual({ kind: 'link', provider: null })
  })
})
