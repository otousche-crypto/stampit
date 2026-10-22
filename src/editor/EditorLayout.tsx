import { Link } from 'react-router'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { SettingsPanel } from './SettingsPanel'
import { PreviewPanel } from './PreviewPanel'
import { ExportPanel } from './ExportPanel'
import { ExportSheet } from './ExportSheet'
import { ResetButton } from './ResetButton'

/**
 * §6.1 — desktop: settings · preview · export; tablet: settings | preview
 * over export; mobile: preview pinned on top, settings below, export in a
 * sheet. One ExportPanel at a time (it owns ids and a live region).
 */
export function EditorLayout() {
  const desktop = useMediaQuery('(min-width: 1024px)')
  const tablet = useMediaQuery('(min-width: 768px)')

  const header = (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
      <Link
        to="/"
        className={cn('rounded-md px-1 text-foreground', typeClass('title'))}
        style={{ fontVariationSettings: fontWeights.semibold }}
      >
        Stampit
      </Link>
      <ResetButton />
    </header>
  )

  if (!tablet) {
    return (
      <div className="flex h-dvh flex-col bg-background">
        {header}
        <div className="h-[35dvh] min-h-44 shrink-0 border-b border-border">
          <PreviewPanel compact />
        </div>
        <div aria-label="Settings" role="region" className="min-h-0 flex-1 overflow-y-auto">
          <SettingsPanel />
        </div>
        <ExportSheet />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      {header}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(300px,360px)_1fr] lg:grid-cols-[360px_1fr_280px]">
        <div aria-label="Settings" role="region" className="min-h-0 overflow-y-auto border-r border-border">
          <SettingsPanel />
        </div>
        <main className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <PreviewPanel />
          </div>
          {!desktop && (
            <div className="flex h-[45%] min-h-0 flex-col border-t border-border">
              <ExportPanel className="flex-1" />
            </div>
          )}
        </main>
        {desktop && (
          <div className="flex min-h-0 flex-col border-l border-border">
            <ExportPanel className="flex-1" />
          </div>
        )}
      </div>
    </div>
  )
}
