/**
 * Open points (PRD §16): the domain and the GitHub repository aren't decided
 * yet. Replace these placeholders once they are.
 */
export const GITHUB_URL = 'https://github.com/' // TODO(§16): repository URL

/** Where the editor lives. At runtime the current origin wins, so any deploy works. */
export function editorBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return `${window.location.origin}/create`
  return 'https://stampit.dev/create' // TODO(§16): final domain
}
