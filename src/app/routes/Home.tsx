import { lazy, Suspense, useRef, type ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'
import type { IconComponentProps } from '@/lib/icon-context'
import { CHANNELS } from '@/badge/channels'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { GITHUB_URL } from '@/config/site'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { DEMO_HTML } from '../demo.generated'

// The editor lives right under the landing; it carries most of the UI kit.
const Create = lazy(() => import('@/app/routes/Create').then((m) => ({ default: m.Create })))

function GithubIcon({ size = 16, className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d={CHANNELS.github.icon.d} />
    </svg>
  )
}

/** Same grey as the editor's preview. */
const PAGE_BACKGROUND = 'bg-[#F2F2F7] dark:bg-background'

/** iPhone 17: 402 × 874 pt screen. */
const IPHONE_17 = { width: 402, height: 874, bezel: 10 }

/** Placeholder block of the skeleton page and browser. */
function Bone({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rounded-lg bg-black/[0.06] dark:bg-white/[0.08]', className)} />
}

/**
 * An iPhone 17 rising from below: only the bottom of its screen shows (the
 * top fades out), so the eye lands on a page footer, where the badge lives,
 * above Safari's bottom bar.
 */
function PhoneBottom({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative h-[min(520px,52dvh)] w-[min(422px,calc(100vw-24px))] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_96px)]"
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[62px] bg-[#1a1a1c] shadow-2xl ring-1 ring-black/40"
        style={{ width: IPHONE_17.width + 2 * IPHONE_17.bezel, padding: IPHONE_17.bezel }}
      >
        <div className="flex flex-col overflow-hidden rounded-[52px] bg-[#F2F2F7] dark:bg-[#1C1C1E]" style={{ height: IPHONE_17.height }}>
          {/* Skeleton page above the footer */}
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 px-5 pb-6">
            <Bone className="h-40 w-full rounded-2xl" />
            <Bone className="h-3 w-11/12" />
            <Bone className="h-3 w-4/5" />
            <Bone className="h-3 w-3/5" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Bone className="h-28 rounded-2xl" />
              <Bone className="h-28 rounded-2xl" />
            </div>
          </div>
          {/* Footer: the badge */}
          <div className="flex shrink-0 flex-col items-center gap-3 border-t border-black/[0.06] px-5 pt-5 pb-4 dark:border-white/[0.08]">
            {children}
            <Bone className="h-2.5 w-28" />
          </div>
          {/* Safari's bottom bar, in skeleton */}
          <div aria-hidden="true" className="flex shrink-0 flex-col items-center gap-3 px-4 pb-2 pt-2">
            <div className="flex w-full items-center gap-2">
              <Bone className="size-11 rounded-full" />
              <div className="flex h-11 flex-1 items-center justify-center rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <Bone className="h-3 w-24 bg-black/[0.08] dark:bg-white/[0.12]" />
              </div>
              <Bone className="size-11 rounded-full" />
            </div>
            <div className="h-[5px] w-[134px] rounded-full bg-black/80 dark:bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Home() {
  const editorRef = useRef<HTMLElement>(null)
  return (
    <>
      <div className={cn('flex min-h-dvh flex-col', PAGE_BACKGROUND)}>
        <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
          <span className={cn('text-foreground', typeClass('title'))} style={{ fontVariationSettings: fontWeights.semibold }}>
            Stampit
          </span>
          <Button asChild variant="ghost" size="compact" leadingIcon={GithubIcon}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-10">
          <div className="flex max-w-xl flex-col items-center gap-3 text-center">
            <h1 className={cn('text-foreground', typeClass('display'))} style={{ fontVariationSettings: fontWeights.bold }}>
              Stamp everything you ship.
            </h1>
            <p className={cn('max-w-md text-muted-foreground', typeClass('subtitle'))}>
              A tiny, customizable badge for your footer. Style it, add your links, paste one snippet. No account, no
              dependency.
            </p>
          </div>

          <PhoneBottom>
            {/* 1.25× fits the phone's width. */}
            <BadgePreview code={DEMO_HTML} scale={1.25} />
          </PhoneBottom>

          {/* Scrolls down to the editor, right below. */}
          <Button
            variant="primary"
            trailingIcon={ArrowDown}
            onClick={() =>
              editorRef.current?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start',
              })
            }
          >
            Create yours
          </Button>
        </main>
      </div>
      <section ref={editorRef} id="create" aria-label="Badge editor" className="h-dvh">
        <Suspense fallback={<div className="h-dvh bg-background" aria-busy="true" />}>
          <Create embedded />
        </Suspense>
      </section>
    </>
  )
}
