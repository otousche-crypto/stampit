import { lazy, Suspense, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'
import type { IconComponentProps } from '@/lib/icon-context'
import { CHANNELS } from '@/badge/channels'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { GITHUB_URL } from '@/config/site'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { DEMO_HTML_DARK, DEMO_HTML_LIGHT } from '../demo.generated'
import { useDemoCycle } from '../useDemoCycle'
import { useAppearance } from '../appearance'

/** First words the demo badge cycles through. */
const DEMO_WORDS = ['Designed', 'Crafted', 'Shipped', 'Built']

/**
 * The demo starts on "Designed by Olivier Tousche", then spins through these
 * (never back to Olivier). All about as wide as his name, so the fixed name
 * slot never looks half empty.
 */
const DEMO_FIRST = 'Olivier Tousche'
const DEMO_NAMES = [
  'Camille Bernard',
  'Lucas Fontaine',
  'Hannah Schmidt',
  'Mateo Gonzalez',
  'Clara Hoffmann',
  'Sofia Marchetti',
  'Jonas Lindqvist',
  'Amélie Rousseau',
  'Daniel Okafor',
  'Yuki Nakamura',
]

// The editor lives right under the landing; it carries most of the UI kit.
const Create = lazy(() => import('@/app/routes/Create').then((m) => ({ default: m.Create })))

function GithubIcon({ size = 16, className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d={CHANNELS.github.icon.d} />
    </svg>
  )
}

function useWindowWidth(): number {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('resize', cb)
      return () => window.removeEventListener('resize', cb)
    },
    () => window.innerWidth,
    () => 1024,
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
  // Narrower than the phone (a real phone visiting): scale it down to fit.
  const width = useWindowWidth()
  const scale = Math.min(1, (width - 32) / (IPHONE_17.width + 2 * IPHONE_17.bezel))
  return (
    // Wider than the phone so its rim and shadow are never clipped; only the
    // top fades out.
    <div className="relative -mb-16 h-[min(580px,60dvh)] w-[min(582px,100vw)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_88px)]">
      <div
        className="absolute bottom-[104px] left-1/2 rounded-[62px] bg-[#1a1a1c] shadow-[0_0_0_2px_#c7c7cc,0_0_0_3px_rgba(0,0,0,0.1),0_40px_80px_-24px_rgba(0,0,0,0.45)] dark:shadow-[0_0_0_2px_#48484d,0_0_0_3px_rgba(255,255,255,0.06),0_40px_80px_-24px_rgba(0,0,0,0.8)]"
        style={{
          width: IPHONE_17.width + 2 * IPHONE_17.bezel,
          padding: IPHONE_17.bezel,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'bottom center',
        }}
      >
        <div className="flex flex-col overflow-hidden rounded-[52px] bg-[#F2F2F7] dark:bg-[#1C1C1E]" style={{ height: IPHONE_17.height }}>
          {/* Skeleton page: kept to a hint */}
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 px-6 pb-8">
            <Bone className="h-40 w-full rounded-2xl" />
            <Bone className="h-3 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
          {/* Footer: the badge */}
          <div className="flex shrink-0 justify-center border-t border-black/[0.06] px-5 py-6 dark:border-white/[0.08]">
            {children}
          </div>
          {/* Safari's bottom bar, in skeleton */}
          <div aria-hidden="true" className="flex shrink-0 flex-col items-center gap-3 px-6 pb-2 pt-1">
            <Bone className="h-11 w-full rounded-full" />
            <div className="h-[5px] w-[134px] rounded-full bg-black/80 dark:bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Home() {
  const editorRef = useRef<HTMLElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  useDemoCycle(demoRef, DEMO_WORDS, DEMO_FIRST, DEMO_NAMES)
  // The demo follows the site's Light / Dark.
  const demoHtml = useAppearance() === 'dark' ? DEMO_HTML_DARK : DEMO_HTML_LIGHT
  return (
    <>
      <div className={cn('flex min-h-dvh flex-col', PAGE_BACKGROUND)}>
        <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
          <span className={cn('text-foreground', typeClass('title'))} style={{ fontVariationSettings: fontWeights.semibold }}>
            Stampit
          </span>
          <Button asChild variant="ghost" size="compact" leadingIcon={GithubIcon}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              {/* Icon only on phones, where the Light / Dark switch takes the middle. */}
              <span className="max-sm:sr-only">View on GitHub</span>
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
            <div ref={demoRef}>
              <BadgePreview code={demoHtml} scale={1.25} />
            </div>
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
