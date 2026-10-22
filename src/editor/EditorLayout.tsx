import { Link } from 'react-router'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { SettingsPanel } from './SettingsPanel'
import { PreviewPanel } from './PreviewPanel'
import { ExportPanel } from './ExportPanel'
import { ResetButton } from './ResetButton'
import { useMediaQuery } from '@/hooks/use-media-query'

export function EditorLayout() {
  // One export panel at a time (it owns ids and a live region).
  const wide = useMediaQuery('(min-width: 1024px)')
  return (
    <div className="flex h-dvh flex-col bg-background">
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
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(300px,360px)_1fr] lg:grid-cols-[360px_1fr_280px]">
        <aside aria-label="Settings" className="min-h-0 overflow-y-auto border-r border-border">
          <SettingsPanel />
        </aside>
        <main className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <PreviewPanel />
          </div>
          {!wide && (
            <div className="border-t border-border">
              <ExportPanel />
            </div>
          )}
        </main>
        {wide && (
          <aside aria-label="Export" className="min-h-0 overflow-y-auto border-l border-border">
            <ExportPanel />
          </aside>
        )}
      </div>
    </div>
  )
}
