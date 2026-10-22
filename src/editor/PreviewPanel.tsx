import { useState } from 'react'
import { Monitor, RotateCcw, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { PhonePreview } from '@/badge/render/PhonePreview'
import { LaptopFrame } from '@/badge/render/LaptopFrame'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { PREVIEW_BACKDROPS, useEditor } from './EditorProvider'

/** Light / Dark backdrop and 1× / 2× zoom. */
export function PreviewControls({ className }: { className?: string }) {
  const { previewBackground, setPreviewBackground, zoom, setZoom, device, setDevice } = useEditor()
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TabsSubtle
        aria-label="Preview device"
        size="compact"
        activeLabel
        selectedIndex={device === 'mobile' ? 1 : 0}
        onSelect={(i) => setDevice(i === 0 ? 'desktop' : 'mobile')}
      >
        <TabsSubtleItem index={0} label="Desktop" icon={Monitor} />
        <TabsSubtleItem index={1} label="Mobile" icon={Smartphone} />
      </TabsSubtle>
      <TabsSubtle
        aria-label="Preview background"
        size="compact"
        selectedIndex={previewBackground === 'dark' ? 1 : 0}
        onSelect={(i) => setPreviewBackground(i === 0 ? 'light' : 'dark')}
      >
        <TabsSubtleItem index={0} label="Light" />
        <TabsSubtleItem index={1} label="Dark" />
      </TabsSubtle>
      {/* A phone shows the badge at its real size: no zoom there. */}
      {device === 'desktop' && (
        <TabsSubtle aria-label="Zoom" size="compact" selectedIndex={zoom === 1 ? 0 : 1} onSelect={(i) => setZoom(i === 0 ? 1 : 2)}>
          <TabsSubtleItem index={0} label="1×" />
          <TabsSubtleItem index={1} label="2×" />
        </TabsSubtle>
      )}
    </div>
  )
}

/** The badge itself, centred on the preview backdrop (which the layout paints). */
export function PreviewStage({
  showHint = true,
  framed = true,
  className,
}: {
  showHint?: boolean
  /** Device frames (MacBook / iPhone). Off on the phone-sized editor. */
  framed?: boolean
  className?: string
}) {
  const { preview, previewBackground, zoom, config, device } = useEditor()
  const dark = previewBackground === 'dark'
  const [phoneReplays, setPhoneReplays] = useState(0)
  // Re-mounting the snippet replays its appear animation.
  const [replays, setReplays] = useState(0)
  return (
    <section aria-label="Preview" className={cn('relative flex min-h-0 items-center justify-center', className)}>
      {!framed ? (
        <BadgePreview key={replays} code={preview.code} interceptLinks scale={zoom} />
      ) : device === 'mobile' ? (
        <PhonePreview key={phoneReplays} code={preview.code} backdrop={PREVIEW_BACKDROPS[previewBackground]} dark={dark} />
      ) : (
        <LaptopFrame backdrop={PREVIEW_BACKDROPS[previewBackground]} dark={dark}>
          <BadgePreview key={replays} code={preview.code} interceptLinks scale={zoom} />
        </LaptopFrame>
      )}
      {config.motion.entrance !== 'none' && (
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={RotateCcw}
          className="absolute right-3 top-3"
          onClick={() => (device === 'mobile' ? setPhoneReplays : setReplays)((n) => n + 1)}
        >
          Replay
        </Button>
      )}
      {showHint && device === 'desktop' && (
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
