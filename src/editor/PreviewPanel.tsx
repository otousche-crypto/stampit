import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { PREVIEW_BACKDROPS, useEditor } from './EditorProvider'

/** Light / Dark backdrop and 1× / 2× zoom. */
export function PreviewControls({ className }: { className?: string }) {
  const { previewBackground, setPreviewBackground, zoom, setZoom } = useEditor()
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TabsSubtle
        aria-label="Preview background"
        size="compact"
        selectedIndex={previewBackground === 'dark' ? 1 : 0}
        onSelect={(i) => setPreviewBackground(i === 0 ? 'light' : 'dark')}
      >
        <TabsSubtleItem index={0} label="Light" />
        <TabsSubtleItem index={1} label="Dark" />
      </TabsSubtle>
      <TabsSubtle aria-label="Zoom" size="compact" selectedIndex={zoom === 1 ? 0 : 1} onSelect={(i) => setZoom(i === 0 ? 1 : 2)}>
        <TabsSubtleItem index={0} label="1×" />
        <TabsSubtleItem index={1} label="2×" />
      </TabsSubtle>
    </div>
  )
}

/** The badge itself, centred on the preview backdrop (which the layout paints). */
export function PreviewStage({ showHint = true, className }: { showHint?: boolean; className?: string }) {
  const { preview, previewBackground, zoom, config } = useEditor()
  const dark = previewBackground === 'dark'
  // Re-mounting the snippet replays its appear animation.
  const [replays, setReplays] = useState(0)
  return (
    <section aria-label="Preview" className={cn('relative flex min-h-0 items-center justify-center', className)}>
      <BadgePreview key={replays} code={preview.code} interceptLinks scale={zoom} />
      {config.motion.entrance !== 'none' && (
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={RotateCcw}
          className="absolute right-3 top-3"
          onClick={() => setReplays((n) => n + 1)}
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
