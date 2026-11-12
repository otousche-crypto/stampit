/**
 * The GitHub contribution calendar, as the profile page shows it (a year,
 * private contributions included when the user shows them). GitHub has no
 * public API for it without a token, and its page can't be read from the
 * browser (CORS): this server route reads it and hands the modal one level
 * (0–4) per day.
 *
 * Runs in Vercel functions and the Vite dev server: relative imports only.
 */

export type Contributions = {
  /** First day shown, a Sunday ("YYYY-MM-DD"). */
  start: string
  /** One digit per day from `start`: GitHub's own level, 0 (none) to 4 (most). */
  levels: string
  /** "N contributions in the last year", when the page says it. */
  total: number | null
}

const USER_RE = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/

/** GitHub rebuilds the graph as contributions come in; an hour on the CDN is plenty. */
const GITHUB_CACHE = 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400'

/** Days and levels from the calendar's markup, in date order. */
export function parseContributions(html: string): Contributions | null {
  const days: [string, string][] = []
  for (const [tag] of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1]
    const level = tag.match(/data-level="([0-4])"/)?.[1]
    if (date && level) days.push([date, level])
  }
  if (!days.length) return null
  days.sort(([a], [b]) => (a < b ? -1 : 1))
  const total = html.match(/([\d,]+)\s+contributions?\s+in the last year/)?.[1]
  return {
    start: days[0][0],
    levels: days.map(([, level]) => level).join(''),
    total: total ? Number(total.replace(/,/g, '')) : null,
  }
}

const json = (status: number, body: unknown, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': cache },
  })

/** GET /api/github?user={login} — read by the profile modal, from any site. */
export async function handleGithub(user: string): Promise<Response> {
  if (!USER_RE.test(user)) return json(400, { error: 'Not a GitHub username.' })
  let res: Response
  try {
    res = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { 'user-agent': 'Stampit (+https://github.com/otousche-crypto/stampit)', accept: 'text/html' },
    })
  } catch {
    return json(502, { error: "Couldn't reach GitHub." })
  }
  if (res.status === 404) return json(404, { error: 'No such GitHub user.' }, 'public, s-maxage=3600')
  if (!res.ok) return json(502, { error: `GitHub answered ${res.status}.` })
  const data = parseContributions(await res.text())
  return data ? json(200, data, GITHUB_CACHE) : json(502, { error: "Couldn't read the contribution graph." })
}
