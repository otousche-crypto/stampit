import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { SettingsPanel } from './SettingsPanel'
import { PreviewPanel } from './PreviewPanel'
import { ExportPanel } from './ExportPanel'

export function EditorLayout() {
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
        <Button variant="ghost" size="compact">
          Reset
        </Button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(300px,360px)_1fr] lg:grid-cols-[360px_1fr_280px]">
        <aside aria-label="Settings" className="min-h-0 overflow-y-auto border-r border-border">
          <SettingsPanel />
        </aside>
        <main className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <PreviewPanel />
          </div>
          <div className="border-t border-border lg:hidden">
            <ExportPanel />
          </div>
        </main>
        <aside aria-label="Export" className="hidden min-h-0 overflow-y-auto border-l border-border lg:block">
          <ExportPanel />
        </aside>
      </div>
    </div>
  )
}
