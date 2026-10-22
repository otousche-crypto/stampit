/**
 * Open point (PRD §16): the domain isn't decided
 * yet. Replace the placeholder once it is.
 */
export const GITHUB_URL = 'https://github.com/otousche-crypto/stampit'

/** Where the editor lives. At runtime the current origin wins, so any deploy works. */
export function editorBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return `${window.location.origin}/create`
  return 'https://stampit.dev/create' // TODO(§16): final domain
}
