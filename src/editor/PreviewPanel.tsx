import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { PREVIEW_BACKDROPS, useEditor } from './EditorProvider'

export function PreviewPanel({ compact = false }: { compact?: boolean }) {
  const { preview, previewBackground, setPreviewBackground, zoom, setZoom } = useEditor()
  const dark = previewBackground === 'dark'

  return (
    <section aria-label="Preview" className="flex h-full min-h-0 flex-col">
      <div className={cn('flex items-center justify-between gap-2 px-3', compact ? 'py-1.5' : 'py-2')}>
        <TabsSubtle
          aria-label="Preview background"
          size="compact"
          selectedIndex={dark ? 1 : 0}
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
      <div
        className={cn(
          'relative mx-3 mb-3 flex flex-1 min-h-0 items-center justify-center overflow-hidden rounded-xl',
          dark ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5',
        )}
        style={{ background: PREVIEW_BACKDROPS[previewBackground], colorScheme: dark ? 'dark' : 'light' }}
      >
        <BadgePreview code={preview.code} interceptLinks scale={zoom} />
        <p
          className={cn(
            'pointer-events-none absolute bottom-2 left-0 right-0 text-center',
            typeClass('caption'),
            dark ? 'text-white/50' : 'text-black/45',
          )}
        >
          Links are disabled in the preview.
        </p>
      </div>
    </section>
  )
}
