import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Code2, Copy, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateBadge } from '@/badge/export/generateHtml'
import { generatePrompt } from '@/badge/export/generatePrompt'
import { editorBaseUrl } from '@/config/site'
import { encodeConfig } from '@/storage/url'
import { spring } from '@/lib/springs'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { FAST_CSS } from './controls'
import { blockingSummary, hasBlockingErrors } from './validation'
import { useEditor } from './EditorProvider'
import { highlightHtml } from './highlight'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older Safari / insecure context.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

/** How long "Copied" stays on screen. Not an animation timing. */
const TOAST_MS = 1800

export function formatWeight(bytes: number): string {
  return `~${Math.max(1, Math.round(bytes / 1024))} KB · zero dependency`
}

export function ExportPanel() {
  const { config, errors, uploadDataUrl, avatarFailed } = useEditor()
  const blocked = hasBlockingErrors(errors)
  const summary = blockingSummary(errors)
  const [editUrl, setEditUrl] = useState<string | undefined>(undefined)
  const [toast, setToast] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
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
  const bytes = useMemo(() => new Blob([code]).size, [code])

  useEffect(() => {
    if (!showCode) return
    let cancelled = false
    highlightHtml(code)
      .then((html) => !cancelled && setHighlighted(html))
      .catch(() => !cancelled && setHighlighted(null))
    return () => {
      cancelled = true
    }
  }, [showCode, code])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [toast])

  const copy = async (text: string) =>
    setToast((await copyText(text)) ? 'Copied' : "Couldn't copy")

  const isUpload = config.avatar.source === 'upload'

  return (
    <section aria-label="Export" className="flex flex-col gap-2 p-3">
      <Button
        variant="primary"
        leadingIcon={Sparkles}
        disabled={blocked}
        aria-describedby={blocked ? 'export-blocked' : undefined}
        className="w-full"
        onClick={() => copy(generatePrompt(config, { editUrl, avatarFailed }))}
      >
        Copy prompt
      </Button>
      <Button
        variant="secondary"
        leadingIcon={Copy}
        disabled={blocked}
        aria-describedby={blocked ? 'export-blocked' : undefined}
        className="w-full"
        onClick={() => copy(code)}
      >
        Copy code
      </Button>
      {blocked ? (
        <p id="export-blocked" className={cn('px-1 text-destructive', typeClass('caption'))}>
          {summary}
        </p>
      ) : (
        <p className={cn('px-1 text-muted-foreground tabular-nums', typeClass('caption'))}>{formatWeight(bytes)}</p>
      )}

      {isUpload && uploadDataUrl && (
        <>
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
        </>
      )}

      <button
        type="button"
        aria-expanded={showCode}
        aria-controls="export-code"
        onClick={() => setShowCode((v) => !v)}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 self-start rounded px-1 py-1 text-muted-foreground underline-offset-2 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)]',
          typeClass('caption'),
        )}
        style={{ fontVariationSettings: fontWeights.normal, ...FAST_CSS }}
      >
        <Code2 size={14} aria-hidden="true" />
        {showCode ? 'Hide code' : 'Show code'}
      </button>
      {showCode && (
        <div
          id="export-code"
          role="region"
          aria-label="Generated code"
          tabIndex={0}
          className="max-h-[50vh] overflow-auto rounded-lg bg-muted text-[11px] leading-[16px] outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)] [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_pre]:p-3"
        >
          {highlighted ? (
            <div className="stampit-code" dangerouslySetInnerHTML={{ __html: highlighted }} />
          ) : (
            <pre className="font-mono">
              <code>{code}</code>
            </pre>
          )}
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {toast ?? ''}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: spring.moderate.exit }}
            transition={spring.moderate}
            className={cn(
              'pointer-events-none fixed bottom-6 left-0 right-0 z-[60] mx-auto flex w-fit items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-background shadow-lg',
              typeClass('caption'),
            )}
          >
            <Check size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
