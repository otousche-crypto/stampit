import { handleGithub } from '../src/embed/github.js'

/** GET /api/github?user={login} — the contribution calendar for the profile modal. */
export async function GET(request: Request): Promise<Response> {
  return handleGithub(new URL(request.url).searchParams.get('user') ?? '', process.env.GITHUB_TOKEN)
}
