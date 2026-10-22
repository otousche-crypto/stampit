import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { GITHUB_URL } from '@/config/site'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { DEMO_HTML } from '../demo.generated'

/** Same grey as the editor's preview, so the phone and the white badge stand out. */
const PAGE_BACKGROUND = 'bg-[#F2F2F7] dark:bg-background'

/** Placeholder block of the skeleton page. */
function Bone({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rounded-lg bg-black/[0.05] dark:bg-white/[0.07]', className)} />
}

/** A large phone, Dynamic Island and status bar included, around the page. */
function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-[min(390px,calc(100vw-32px))] rounded-[56px] bg-[#1a1a1c] p-3 shadow-2xl ring-1 ring-black/40">
      <div className="relative flex h-[min(760px,calc(100dvh-180px))] min-h-[560px] flex-col overflow-hidden rounded-[44px] bg-[#F2F2F7] dark:bg-[#1C1C1E]">
        <div aria-hidden="true" className="flex h-12 shrink-0 items-center justify-between px-7 pt-1 text-foreground">
          <span className="text-[15px]" style={{ fontVariationSettings: fontWeights.semibold }}>
            9:41
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-4 rounded-[3px] bg-current opacity-80" />
            <span className="h-3 w-6 rounded-[4px] border border-current p-[1.5px] opacity-80">
              <span className="block h-full w-full rounded-[2px] bg-current" />
            </span>
          </span>
        </div>
        <div aria-hidden="true" className="absolute left-1/2 top-3 h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  )
}

export function Home() {
  return (
    <div className={cn('flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10', PAGE_BACKGROUND)}>
      <Phone>
        {/* The page, in skeleton form, around the real content. */}
        <header className="flex shrink-0 items-center justify-between px-5 py-3">
          <span className={cn('text-foreground', typeClass('title'))} style={{ fontVariationSettings: fontWeights.semibold }}>
            Stampit
          </span>
          <Button asChild variant="ghost" size="compact">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-hidden px-6 pt-8 text-center">
          <h1 className={cn('text-foreground', typeClass('display'))} style={{ fontVariationSettings: fontWeights.bold }}>
            Stamp everything you ship.
          </h1>
          <p className={cn('text-muted-foreground', typeClass('subtitle'))}>
            A tiny, customizable badge for your footer. Style it, add your links, paste one snippet. No account, no
            dependency.
          </p>
          {/* 1.25× fits the phone's width; the grey screen sets the white badge off. */}
          <div className="py-4">
            <BadgePreview code={DEMO_HTML} scale={1.25} />
          </div>
          <div className="flex w-full flex-col gap-3 opacity-90">
            <Bone className="h-36 w-full rounded-2xl" />
            <Bone className="h-3 w-11/12" />
            <Bone className="h-3 w-4/5" />
            <Bone className="h-3 w-3/5" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Bone className="h-24 rounded-2xl" />
              <Bone className="h-24 rounded-2xl" />
            </div>
          </div>
        </main>
      </Phone>

      <Button asChild variant="primary" trailingIcon={ArrowRight}>
        <Link to="/create">Create yours</Link>
      </Button>
    </div>
  )
}
