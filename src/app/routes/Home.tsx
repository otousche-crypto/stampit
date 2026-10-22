import { lazy, Suspense, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { ArrowDown, ChevronRight } from 'lucide-react'
import { GITHUB_URL } from '@/config/site'
import { spring } from '@/lib/springs'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
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

/** Fluid's fast tier for the hand-written hover states below. */
const FAST_CSS = { transitionDuration: `${spring.fast.duration}s` }

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
  // 40 px of air on each side on phones.
  const scale = Math.min(1, (width - 80) / (IPHONE_17.width + 2 * IPHONE_17.bezel))
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

        <main className="flex flex-1 flex-col items-center gap-10 px-4 pb-10 pt-28 sm:pt-32">
          <div className="flex max-w-4xl flex-col items-center gap-7 text-center">
            {/* Announcement pill */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-full p-1 pr-3 ring-1 ring-black/10 transition-colors hover:bg-black/[0.03] dark:ring-white/15 dark:hover:bg-white/[0.04]"
              style={FAST_CSS}
            >
              <span
                className="rounded-full bg-foreground px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em] text-background"
                style={{ fontVariationSettings: fontWeights.bold }}
              >
                Open source
              </span>
              <span className={cn('text-muted-foreground', typeClass('body'))}>Free · No account · No dependency</span>
              <ChevronRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" style={FAST_CSS} />
            </a>

            {/* Hero: a marketing headline, deliberately beyond the type scale. */}
            <h1
              className="text-[clamp(44px,9vw,104px)] leading-[0.92] tracking-[-0.045em]"
              style={{ fontVariationSettings: fontWeights.bold }}
            >
              <span className="block text-foreground">Stamp everything</span>
              <span className="block text-foreground/35">you ship.</span>
            </h1>

            <p className="max-w-2xl text-[clamp(17px,2.2vw,21px)] leading-[1.5] text-muted-foreground">
              A tiny, customizable badge for your footer. Style it, add your links, paste one snippet. No account, no
              dependency.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
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
              <Button asChild variant="secondary">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>

          <PhoneBottom>
            {/* 1.25× fits the phone's width. */}
            <div ref={demoRef}>
              <BadgePreview code={demoHtml} scale={1.25} />
            </div>
          </PhoneBottom>
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
