import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Elevated } from '@/lib/elevated'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { SettingsPanel } from './SettingsPanel'
import { PreviewStage, useBackdropStyle } from './PreviewPanel'
import { ExportPanel } from './ExportPanel'
import { ExportSheet } from './ExportSheet'
import { ResetButton } from './ResetButton'

function Brand() {
  return (
    <Link
      to="/"
      className={cn('rounded-md px-1 text-foreground', typeClass('title'))}
      style={{ fontVariationSettings: fontWeights.semibold }}
    >
      Stampit
    </Link>
  )
}

/** A floating panel over the full-screen preview backdrop. */
function Card({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <Elevated offset={2} role="region" aria-label={label} className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl', className)}>
      {children}
    </Elevated>
  )
}

/**
 * §6.1 — the preview backdrop fills the screen; settings (left) and export
 * (right) float over it as cards. Tablet: export card under the preview.
 * Mobile: preview pinned on top, settings below, export in a sheet.
 * One ExportPanel at a time (it owns ids and a live region).
 */
export function EditorLayout({ autoFocus = true }: { autoFocus?: boolean }) {
  const desktop = useMediaQuery('(min-width: 1024px)')
  const tablet = useMediaQuery('(min-width: 768px)')
  const backdrop = useBackdropStyle()
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [tablet])

  if (!tablet) {
    return (
      <div ref={rootRef} className="flex h-dvh flex-col bg-background">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
          <Brand />
          <ResetButton />
        </header>
        <div className="flex h-[35dvh] min-h-44 shrink-0 flex-col overflow-hidden border-b border-border" style={backdrop}>
          <PreviewStage showHint={false} className="flex-1" />
        </div>
        <div aria-label="Settings" role="region" className="min-h-0 flex-1 overflow-y-auto">
          <SettingsPanel autoFocus={autoFocus} />
        </div>
        {/* Only while the editor is on screen (it sits under the home page). */}
        {inView && <ExportSheet />}
      </div>
    )
  }

  const settings = (
    <Card label="Settings" className="h-full">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
        <Brand />
        <ResetButton />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SettingsPanel autoFocus={autoFocus} />
      </div>
    </Card>
  )

  const center = (
    <div className="flex min-h-0 flex-1 flex-col">
      <PreviewStage className="flex-1" />
    </div>
  )

  return (
    <div className="h-dvh overflow-hidden" style={backdrop}>
      <div className="grid h-full grid-cols-[minmax(300px,360px)_1fr] gap-4 p-4 lg:grid-cols-[360px_1fr_300px]">
        {settings}
        {desktop ? (
          <>
            {center}
            <Card label="Get your badge" className="h-[42%] self-start">
              <ExportPanel className="flex-1" />
            </Card>
          </>
        ) : (
          <div className="flex min-h-0 flex-col gap-4">
            {center}
            <Card label="Get your badge" className="h-[45%] shrink-0">
              <ExportPanel className="flex-1" />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
