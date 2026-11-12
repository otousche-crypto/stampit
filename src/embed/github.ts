/**
 * The GitHub contribution calendar, as the profile page shows it (a year,
 * private contributions included when the user shows them), one level
 * (0–4) per day for the modal. Read through the official GraphQL API with
 * Stampit's own token (GITHUB_TOKEN: a fine-grained token, no permission
 * needed); without one, or if the API fails, from the profile page itself
 * (which the browser can't read: CORS).
 *
 * Runs in Vercel functions and the Vite dev server: relative imports only.
 */

export type Contributions = {
  /** First day shown, a Sunday ("YYYY-MM-DD"). */
  start: string
  /** One character per day from `start`: GitHub's own level, 0 (none) to 4 (most); "-" before the year starts. */
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

const json = (status: number, body: unknown, cache = 'no-store', source?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'cache-control': cache,
      ...(source && { 'x-stampit-source': source }),
    },
  })

const LEVELS: Record<string, string> = {
  NONE: '0',
  FIRST_QUARTILE: '1',
  SECOND_QUARTILE: '2',
  THIRD_QUARTILE: '3',
  FOURTH_QUARTILE: '4',
}

type Calendar = {
  totalContributions: number
  weeks: { contributionDays: { date: string; contributionLevel: string }[] }[]
}

/** The GraphQL calendar in the modal's shape. Starts on a Sunday, like the profile graph: earlier days are "-". */
export function fromCalendar(calendar: Calendar): Contributions | null {
  const days = calendar.weeks.flatMap((w) => w.contributionDays)
  if (!days.length) return null
  const lead = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const start = new Date(Date.parse(`${days[0].date}T00:00:00Z`) - lead * 86_400_000).toISOString().slice(0, 10)
  return {
    start,
    levels: '-'.repeat(lead) + days.map((d) => LEVELS[d.contributionLevel] ?? '0').join(''),
    total: calendar.totalContributions,
  }
}

const QUERY =
  'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionLevel}}}}}}'

/** `null`: no such user. Throws when the API can't answer. */
async function viaGraphql(user: string, token: string): Promise<Contributions | null> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'Stampit' },
    body: JSON.stringify({ query: QUERY, variables: { login: user } }),
  })
  if (!res.ok) throw new Error(`GraphQL ${res.status}`)
  const body = (await res.json()) as {
    data?: { user: { contributionsCollection: { contributionCalendar: Calendar } } | null }
    errors?: { type?: string }[]
  }
  if (body.errors?.some((e) => e.type === 'NOT_FOUND') || body.data?.user === null) return null
  const calendar = body.data?.user?.contributionsCollection.contributionCalendar
  if (!calendar) throw new Error('GraphQL: no calendar')
  return fromCalendar(calendar)
}

/** GET /api/github?user={login} — read by the profile modal, from any site. */
export async function handleGithub(user: string, token?: string): Promise<Response> {
  if (!USER_RE.test(user)) return json(400, { error: 'Not a GitHub username.' })
  if (token) {
    try {
      const data = await viaGraphql(user, token)
      return data ? json(200, data, GITHUB_CACHE, 'graphql') : json(404, { error: 'No such GitHub user.' }, 'public, s-maxage=3600')
    } catch {
      // Rate limit, revoked token, outage: the profile page still has it.
    }
  }
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
  return data ? json(200, data, GITHUB_CACHE, 'page') : json(502, { error: "Couldn't read the contribution graph." })
}
