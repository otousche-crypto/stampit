import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TabsSubtle, TabsSubtleItem, TabsSubtlePanel } from '@/components/ui/tabs-subtle'
import { generateBadge } from '@/badge/export/generateHtml'
import { generatePrompt } from '@/badge/export/generatePrompt'
import { editorBaseUrl } from '@/config/site'
import { encodeConfig } from '@/storage/url'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { CopyField } from './CopyField'
import { blockingSummary, hasBlockingErrors } from './validation'
import { useEditor } from './EditorProvider'
import { highlightHtml } from './highlight'

export function formatWeight(bytes: number): string {
  return `~${Math.max(1, Math.round(bytes / 1024))} KB · zero dependency`
}

/** Right column: a Prompt tab and a Code tab, each a copy field. */
export function ExportPanel({ className }: { className?: string }) {
  const { config, errors, uploadDataUrl, avatarFailed } = useEditor()
  const blocked = hasBlockingErrors(errors)
  const [tab, setTab] = useState(0)
  const [editUrl, setEditUrl] = useState<string | undefined>(undefined)
  const [highlighted, setHighlighted] = useState<string | null>(null)

  // The edit link goes in the snippet's header comment.
  useEffect(() => {
    let cancelled = false
    encodeConfig(config).then((encoded) => {
      if (!cancelled) setEditUrl(`${editorBaseUrl()}#c=${encoded}`)
    })
    return () => {
      cancelled = true
    }
  }, [config])

  const code = useMemo(
    () => generateBadge(config, { editUrl, uploadDataUrl, avatarFailed }).code,
    [config, editUrl, uploadDataUrl, avatarFailed],
  )
  const prompt = useMemo(() => generatePrompt(config, { editUrl, avatarFailed }), [config, editUrl, avatarFailed])
  const bytes = useMemo(() => new Blob([code]).size, [code])

  // Shiki loads only once the Code tab is shown.
  useEffect(() => {
    if (tab !== 1) return
    let cancelled = false
    highlightHtml(code)
      .then((html) => !cancelled && setHighlighted(html))
      .catch(() => !cancelled && setHighlighted(null))
    return () => {
      cancelled = true
    }
  }, [tab, code])

  const isUpload = config.avatar.source === 'upload'

  return (
    <section aria-label="Export" className={cn('flex min-h-0 flex-col gap-2 p-3', className)}>
      <TabsSubtle idPrefix="export" size="compact" selectedIndex={tab} onSelect={setTab}>
        <TabsSubtleItem index={0} label="Prompt" />
        <TabsSubtleItem index={1} label="Code" />
      </TabsSubtle>

      <TabsSubtlePanel idPrefix="export" index={0} selectedIndex={tab} className="flex min-h-0 flex-1 flex-col gap-1.5">
        <p className={cn('px-1 text-muted-foreground', typeClass('caption'))}>
          Paste into your AI coding agent. It adds the badge with your project's stack.
        </p>
        <CopyField label="Prompt" value={prompt} disabled={blocked} className="min-h-40 flex-1" />
      </TabsSubtlePanel>

      <TabsSubtlePanel idPrefix="export" index={1} selectedIndex={tab} className="flex min-h-0 flex-1 flex-col gap-1.5">
        <p className={cn('px-1 text-muted-foreground tabular-nums', typeClass('caption'))}>
          Plain HTML/CSS{config.click.mode === 'bubbles' ? '/JS' : ''}. {formatWeight(bytes)}.
        </p>
        <CopyField label="Code" value={code} disabled={blocked} className="min-h-40 flex-1">
          {highlighted ? <div className="stampit-code" dangerouslySetInnerHTML={{ __html: highlighted }} /> : undefined}
        </CopyField>
      </TabsSubtlePanel>

      {blocked && (
        <p role="status" className={cn('px-1 text-destructive', typeClass('caption'))}>
          {blockingSummary(errors)}
        </p>
      )}

      {isUpload && uploadDataUrl && (
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="compact"
            leadingIcon={Download}
            className="self-start"
            onClick={() => {
              const a = document.createElement('a')
              a.href = uploadDataUrl
              a.download = 'stampit-avatar.webp'
              a.click()
            }}
          >
            Download avatar
          </Button>
          <p className={cn('px-1 text-muted-foreground', typeClass('caption'))}>
            Your uploaded photo isn't included in the page link. Shared links will show your initials.
          </p>
        </div>
      )}
    </section>
  )
}
