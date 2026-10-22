import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { PREVIEW_BACKDROPS, useEditor } from './EditorProvider'

/** The badge itself, centred on the preview backdrop (which the layout paints). */
export function PreviewStage({ showHint = true, className }: { showHint?: boolean; className?: string }) {
  const { preview, previewBackground, zoom, config, replayEntrance, entranceKey } = useEditor()
  const dark = previewBackground === 'dark'
  return (
    <section aria-label="Preview" className={cn('relative flex min-h-0 items-center justify-center', className)}>
      <BadgePreview key={entranceKey} code={preview.code} interceptLinks scale={zoom} />
      {config.motion.entrance !== 'none' && (
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={RotateCcw}
          className="absolute right-3 top-3"
          onClick={replayEntrance}
        >
          Replay
        </Button>
      )}
      {showHint && (
        <p
          className={cn(
            'pointer-events-none absolute bottom-3 left-0 right-0 text-center',
            typeClass('caption'),
            dark ? 'text-white/60' : 'text-black/55',
          )}
        >
          Links are disabled in the preview.
        </p>
      )}
    </section>
  )
}

/** Backdrop style for whatever area shows the preview. */
export function useBackdropStyle() {
  const { previewBackground } = useEditor()
  return {
    background: PREVIEW_BACKDROPS[previewBackground],
    colorScheme: previewBackground === 'dark' ? 'dark' : 'light',
  } as const
}
