import { useEffect, useState } from 'react'
import { Check, KeyRound, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputField, InputGroup } from '@/components/ui/input-group'
import type { GeneratedBadge } from '@/badge/export/generateHtml'
import { PublishError, embedTag, publishBadge } from '@/embed/client'
import { loadEmbed, loadPublishKey, saveEmbed, savePublishKey, type EmbedState } from '@/storage/local'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { CopyField } from './CopyField'
import { WELL_FIELD } from './controls'
import { useEditor } from './EditorProvider'

/** "just now", "5 min ago", "3 h ago", "2 d ago". */
function ago(iso: string, now: number): string {
  const minutes = Math.round((now - Date.parse(iso)) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`
  return `${Math.round(minutes / 60 / 24)} d ago`
}

/** What the sites show: the published markup, CSS and script. */
const fingerprint = (badge: GeneratedBadge) => badge.css + badge.html + (badge.js ?? '')

/**
 * Embed tab: publish the badge once, paste one script tag on each site, and
 * every later publish updates them all. Owner only for now: publishing
 * needs the key set as STAMPIT_PUBLISH_TOKEN on the server.
 */
export function EmbedPanel({ badge, blocked }: { badge: GeneratedBadge; blocked: boolean }) {
  const { config, revealErrors } = useEditor()
  const [key, setKey] = useState(loadPublishKey)
  const [draftKey, setDraftKey] = useState('')
  const [embed, setEmbed] = useState<EmbedState | null>(loadEmbed)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Keeps "published N min ago" current.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  // The id is fixed by the first publish, so sites keep working after a Reset.
  const id = embed?.id ?? config.id
  const live = embed?.code === fingerprint(badge)

  const publish = async () => {
    if (blocked) return revealErrors()
    setBusy(true)
    setError(null)
    try {
      const updatedAt = await publishBadge(badge, id, key)
      const next = { id, code: fingerprint(badge), updatedAt }
      saveEmbed(next)
      setEmbed(next)
      setNow(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publishing failed.')
      // A refused key is forgotten, so the field comes back.
      if (e instanceof PublishError && e.status === 401) {
        savePublishKey(null)
        setKey('')
      }
    } finally {
      setBusy(false)
    }
  }

  const caption = cn('px-1 text-muted-foreground', typeClass('caption'))

  if (!key) {
    return (
      <form
        className="flex flex-col gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          const value = draftKey.trim()
          if (!value) return
          savePublishKey(value)
          setKey(value)
          setDraftKey('')
          setError(null)
        }}
      >
        <p className={caption}>
          Host your badge on Stampit: edit it here, and every site that embeds it updates. Only you can publish for now.
        </p>
        <InputGroup size="compact" className="w-full">
          <InputField
            index={0}
            label="Publish key"
            className={WELL_FIELD}
            type="password"
            autoComplete="off"
            icon={KeyRound}
            placeholder="STAMPIT_PUBLISH_TOKEN"
            value={draftKey}
            onChange={setDraftKey}
          />
        </InputGroup>
        <Button type="submit" variant="primary" size="compact" disabled={!draftKey.trim()} className="shrink-0">
          Save key
        </Button>
        {error && (
          <p role="alert" className={cn('px-1 text-destructive', typeClass('caption'))}>
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5">
      <Button
        variant="primary"
        size="compact"
        leadingIcon={live ? Check : Upload}
        loading={busy}
        disabled={live || busy}
        onClick={publish}
        className="shrink-0"
      >
        {live ? 'Published' : embed ? 'Publish changes' : 'Publish'}
      </Button>
      <p className={caption} aria-live="polite">
        {live && embed
          ? `Live on your sites · published ${ago(embed.updatedAt, now)}.`
          : embed
            ? "You have changes that aren't live yet."
            : 'Publish once, then paste the line below on each site.'}
      </p>
      {error && (
        <p role="alert" className={cn('px-1 text-destructive', typeClass('caption'))}>
          {error}
        </p>
      )}
      <CopyField label="Embed code" value={embedTag(id)} disabled={!embed} className="min-h-24">
        <pre>{embedTag(id)}</pre>
      </CopyField>
      <p className={caption}>Paste it once on each site, where the badge goes. Each publish reaches them all within a minute.</p>
      <button
        type="button"
        className={cn('self-start px-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline', typeClass('caption'))}
        onClick={() => {
          savePublishKey(null)
          setKey('')
        }}
      >
        Forget publish key
      </button>
    </div>
  )
}
