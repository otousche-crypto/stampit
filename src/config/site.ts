/**
 * Open point (PRD §16): the domain isn't decided
 * yet. Replace the placeholder once it is.
 */
export const GITHUB_URL = 'https://github.com/otousche-crypto/stampit'

/** Where Stampit is served. At runtime the current origin wins, so any deploy works. */
export function siteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://stampit.dev' // TODO(§16): final domain
}

/** Where the editor lives. */
export function editorBaseUrl(): string {
  return `${siteOrigin()}/create`
}
