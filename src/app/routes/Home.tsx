import { lazy, Suspense, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { DEMO_HTML_DARK, DEMO_HTML_LIGHT } from '../demo.generated'
import { useDemoCycle, type DemoPerson } from '../useDemoCycle'
import { useAppearance } from '../appearance'

/** First words the demo badge cycles through. */
const DEMO_WORDS = ['Designed', 'Crafted', 'Shipped', 'Built']

/**
 * The demo starts on "Designed by Olivier Tousche", then spins
 * through these people (never back to Olivier). Names are all about as wide
 * as his, so the fixed name slot never looks half empty. Avatars: Microsoft
 * Fluent Emoji 3D (MIT), designers, developers and builders.
 */
const DEMO_FIRST = 'Olivier Tousche'
const DEMO_PEOPLE: DemoPerson[] = [
  { name: 'Camille Bernard', avatar: '/avatars/camille.png' },
  { name: 'Lucas Fontaine', avatar: '/avatars/lucas.png' },
  { name: 'Hannah Schmidt', avatar: '/avatars/hannah.png' },
  { name: 'Mateo Gonzalez', avatar: '/avatars/mateo.png' },
  { name: 'Clara Hoffmann', avatar: '/avatars/clara.png' },
  { name: 'Sofia Marchetti', avatar: '/avatars/sofia.png' },
  { name: 'Jonas Lindqvist', avatar: '/avatars/jonas.png' },
  { name: 'Amélie Rousseau', avatar: '/avatars/amelie.png' },
  { name: 'Daniel Okafor', avatar: '/avatars/daniel.png' },
  { name: 'Yuki Nakamura', avatar: '/avatars/yuki.png' },
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

/** Same colours as the editor preview (light and dark), so home and editor run on as one surface. */
const PAGE_BACKGROUND = 'bg-[#F2F2F7] dark:bg-[#1C1C1E]'

/**
 * Dark hero: near black at the top, easing into the editor's grey at the
 * bottom, so the page stays one continuous surface.
 */
const HERO_DARK = 'dark:bg-[linear-gradient(to_bottom,#070708_0%,#070708_55%,#1C1C1E_100%)]'

/** iPhone 17: 402 × 874 pt screen. */
const IPHONE_17 = { width: 402, height: 874, bezel: 10 }
/** The phone is drawn 10 % larger than life on wide screens. */
const PHONE_SCALE = 1.1

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
  // A touch larger than life where there is room; 40 px of air on each side on phones.
  const scale = Math.min(PHONE_SCALE, (width - 80) / (IPHONE_17.width + 2 * IPHONE_17.bezel))
  return (
    // Wider than the phone so its rim and shadow are never clipped; only the
    // top fades out.
    <div className="relative -mb-20 mt-2 h-[min(470px,50dvh)] w-[min(822px,100vw)] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_80px)]">
      <div
        className="absolute bottom-[104px] left-1/2 rounded-[62px] bg-[#1a1a1c] shadow-[0_0_0_2px_#c7c7cc,0_0_0_3px_rgba(0,0,0,0.1),0_40px_80px_-24px_rgba(0,0,0,0.45)] dark:shadow-[0_0_0_2px_#48484d,0_0_0_3px_rgba(255,255,255,0.06),0_40px_80px_-24px_rgba(0,0,0,0.9),0_0_160px_40px_rgba(0,0,0,0.85)]"
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
  useDemoCycle(demoRef, DEMO_WORDS, DEMO_FIRST, DEMO_PEOPLE)
  // The demo follows the site's Light / Dark.
  const demoHtml = useAppearance() === 'dark' ? DEMO_HTML_DARK : DEMO_HTML_LIGHT
  return (
    <>
      <div className={cn('flex min-h-dvh flex-col', PAGE_BACKGROUND, HERO_DARK)}>

        <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-24 sm:pt-28">
          {/* Hero: a marketing headline, deliberately beyond the type scale. */}
          <h1
            className="text-center text-[clamp(42px,9vw,104px)] leading-[0.92] tracking-[-0.045em]"
            style={{ fontVariationSettings: fontWeights.bold }}
          >
            <span className="block text-foreground">Stamp everything</span>
            <span className="block text-foreground/35">you ship.</span>
          </h1>

          <PhoneBottom>
            {/* 1.25× fits the phone's width. */}
            <div ref={demoRef}>
              <BadgePreview code={demoHtml} scale={1.25} />
            </div>
          </PhoneBottom>

          <p className="max-w-2xl text-center text-[clamp(16px,2.2vw,21px)] leading-[1.5] text-muted-foreground">
            A tiny, customizable badge. Style it, add your links, paste one snippet. No account, no
            dependency.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-7">
            {/* Scrolls down to the editor, right below. */}
            {/* The page's one call to action: a step above the control ladder. */}
            <Button
              variant="primary"
              trailingIcon={ArrowDown}
              className="h-12 gap-2 pl-6 pr-5 text-[16px] leading-6 [&_svg]:size-[18px]"
              onClick={() =>
                editorRef.current?.scrollIntoView({
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                  block: 'start',
                })
              }
            >
              Create yours
            </Button>
          </div>
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
