import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link2 } from 'lucide-react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import { PROFILE_STAGE_ATTR, generateBadge, githubUser } from '@/badge/export/generateHtml'
import { BadgePreview } from '@/badge/render/BadgePreview'
import type { BadgeConfig } from '@/badge/schema'
import { siteOrigin } from '@/config/site'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { Hint, SwitchRow, WELL_FIELD } from './controls'
import { ProjectsEditor } from './ProjectsEditor'
import { SocialLinks } from './SocialLinks'
import { useEditor } from './EditorProvider'

type Click = BadgeConfig['click']

/** A group of settings, separated from the next by a hairline (as in the badge settings). */
function Group({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 border-b border-border px-2 py-3 last:border-b-0">{children}</div>
}

/** GitHub's help page on contributions that don't show up. */
const MISSING_CONTRIBUTIONS_HELP =
  'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile'

/** Below this many contributions a year, the graph looks empty: say why it may be. */
const FEW_CONTRIBUTIONS = 30

/** Lets the address settle before asking for its graph. Not an animation timing. */
const LOOKUP_DELAY_MS = 400

type GithubState = { user: string } & ({ status: 'loading' } | { status: 'ok'; total: number | null } | { status: 'error'; message: string })

/** Under the social links: the year's total as visitors will see it, and help when it looks empty. */
function GithubStatus({ user }: { user: string | null }) {
  const [state, setState] = useState<GithubState | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setState({ user, status: 'loading' })
      try {
        const res = await fetch(`/api/github?user=${encodeURIComponent(user)}`)
        const body = (await res.json()) as { total?: number | null }
        if (cancelled) return
        if (res.ok) setState({ user, status: 'ok', total: body.total ?? null })
        else setState({ user, status: 'error', message: res.status === 404 ? `No GitHub user @${user}.` : "Couldn't load your GitHub activity right now." })
      } catch {
        if (!cancelled) setState({ user, status: 'error', message: "Couldn't load your GitHub activity right now." })
      }
    }, LOOKUP_DELAY_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [user])

  if (!user) return <Hint>Add your GitHub link to show your activity.</Hint>
  if (!state || state.user !== user || state.status === 'loading') return <Hint>Loading your GitHub activity…</Hint>
  if (state.status === 'error') return <Hint tone="error">{state.message}</Hint>
  const few = state.total !== null && state.total < FEW_CONTRIBUTIONS
  return (
    <Hint>
      {state.total === null ? 'Your GitHub graph, as on your profile.' : `${state.total.toLocaleString('en')} contributions in the last year, as on your profile.`}
      {few && (
        <>
          {' '}
          Activity missing? Link your commit email to GitHub and show private contributions on your profile.{' '}
          <a href={MISSING_CONTRIBUTIONS_HELP} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            Learn more
          </a>
        </>
      )}
    </Hint>
  )
}

/**
 * The profile editor's settings: what the modal shows when the badge is
 * clicked. Off, the badge is a plain link (set in the badge settings).
 */
export function ProfilePanel() {
  const { config, update, errors, errorsShown } = useEditor()
  const on = config.click.mode === 'profile'
  const [touched, setTouched] = useState(false)
  const setClick = (patch: Partial<Click>) => update((c) => ({ ...c, click: { ...c.click, ...patch } }))
  const setLink = (patch: Partial<Click['link']>) => setClick({ link: { ...config.click.link, ...patch } })

  return (
    <div className="flex flex-col pb-24 md:pb-3">
      <Group>
        <SwitchRow label="Open a profile on click" checked={on} onToggle={() => setClick({ mode: on ? 'link' : 'profile' })} />
        {!on && <Hint>Your badge opens a modal with your role, links, GitHub activity and projects.</Hint>}
      </Group>
      {on && (
        <>
          <Group>
            <InputGroup size="compact" className="w-full">
              <InputField
                index={0}
                label="Role"
                className={WELL_FIELD}
                placeholder="Product builder"
                maxLength={40}
                value={config.text.role}
                onChange={(role) => update((c) => ({ ...c, text: { ...c.text, role } }))}
              />
            </InputGroup>
          </Group>
          <Group>
            <InputGroup size="compact" className="w-full">
              <div
                data-field="linkUrl"
                onBlur={() => {
                  setTouched(true)
                  const normalized = normalizeUrl(config.click.link.url)
                  if (normalized !== config.click.link.url) setLink({ url: normalized })
                }}
              >
                <InputField
                  index={0}
                  label="Portfolio"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  icon={Link2}
                  placeholder="yoursite.com"
                  value={config.click.link.url}
                  error={touched || errorsShown ? errors.linkUrl : undefined}
                  onChange={(url) => setLink({ url })}
                />
              </div>
            </InputGroup>
            <SocialLinks collapsible={false} />
            <GithubStatus user={githubUser(config)} />
          </Group>
          <Group>
            <ProjectsEditor />
          </Group>
          <Group>
            <SwitchRow
              label="Open links in new tab"
              checked={config.click.link.newTab}
              onToggle={() => setLink({ newTab: !config.click.link.newTab })}
            />
          </Group>
        </>
      )}
    </div>
  )
}

/** The modal itself, drawn open on the preview backdrop. */
export function ProfileStage({ className }: { className?: string }) {
  const { config, avatarFailed, previewBackground } = useEditor()
  const on = config.click.mode === 'profile'
  const dark = previewBackground === 'dark'
  const code = useMemo(
    () =>
      on
        ? generateBadge(config, {
            avatarFailed,
            assetOrigin: siteOrigin(),
            previewScheme: config.theme.adaptToSite ? previewBackground : undefined,
            skipEntrance: true,
            profileOnly: true,
          }).code
        : '',
    [on, config, avatarFailed, previewBackground],
  )
  return (
    <section
      aria-label="Profile preview"
      {...{ [PROFILE_STAGE_ATTR]: '' }}
      className={cn('flex min-h-0 overflow-y-auto', className)}
    >
      <div className="m-auto flex flex-col items-center gap-3 p-6">
        {on ? (
          <>
            <BadgePreview code={code} interceptLinks />
            <p className={cn(typeClass('caption'), dark ? 'text-white/60' : 'text-black/55')}>
              What visitors see when they click your badge.
            </p>
          </>
        ) : (
          <p className={cn('max-w-64 text-center', typeClass('body'), dark ? 'text-white/60' : 'text-black/55')}>
            Turn on “Open a profile on click” to design the modal.
          </p>
        )}
      </div>
    </section>
  )
}
