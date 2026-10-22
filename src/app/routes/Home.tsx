import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { GITHUB_URL } from '@/config/site'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { DEMO_HTML } from '../demo.generated'

/** Same grey as the editor's preview, so the white badge stands out clearly. */
const PAGE_BACKGROUND = 'bg-[#F2F2F7] dark:bg-background'

export function Home() {
  return (
    <div className={cn('flex min-h-dvh flex-col', PAGE_BACKGROUND)}>
      <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
        <span className={cn('text-foreground', typeClass('title'))} style={{ fontVariationSettings: fontWeights.semibold }}>
          Stampit
        </span>
        <Button asChild variant="ghost" size="compact">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-16 sm:px-6">
        <div className="flex max-w-xl flex-col items-center gap-3 text-center">
          <h1 className={cn('text-foreground', typeClass('display'))} style={{ fontVariationSettings: fontWeights.bold }}>
            Stamp everything you ship.
          </h1>
          <p className={cn('max-w-md text-muted-foreground', typeClass('subtitle'))}>
            A tiny, customizable badge for your footer. Style it, add your links, paste one snippet. No account, no
            dependency.
          </p>
        </div>

        <BadgePreview code={DEMO_HTML} scale={1.5} />

        <Button asChild variant="primary" trailingIcon={ArrowRight}>
          <Link to="/create">Create yours</Link>
        </Button>
      </main>
    </div>
  )
}
