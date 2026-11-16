import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Elevated } from '@/lib/elevated'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { SettingsPanel } from './SettingsPanel'
import { PreviewStage, useBackdropStyle } from './PreviewPanel'
import { ExportPanel } from './ExportPanel'
import { ExportSheet } from './ExportSheet'
import { ResetButton } from './ResetButton'
import { ProfilePanel, ProfileStage } from './ProfilePanel'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { spring } from '@/lib/springs'
import { typeClass } from '@/lib/type-scale'
import { useEditor, type EditorPane } from './EditorProvider'

const STEPS: { value: EditorPane; label: string }[] = [
  { value: 'stamp', label: 'Stamp' },
  { value: 'pop', label: 'Pop' },
]

/** Stamp, then Pop: the badge, then the modal it opens. Both steps stay clickable. */
function PaneStepper({ className }: { className?: string }) {
  const { pane, setPane } = useEditor()
  const current = STEPS.findIndex((s) => s.value === pane)
  return (
    <nav aria-label="Editor steps" className={className}>
      <ol className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const active = index === current
          const done = index < current
          return (
            <li key={step.value} className={cn('flex items-center gap-2', index > 0 && 'flex-1')}>
              {index > 0 && (
                // The track fills once Stamp is behind.
                <span aria-hidden="true" className="relative h-px flex-1 overflow-hidden rounded-full bg-border">
                  <motion.span
                    className="absolute inset-0 origin-left bg-foreground"
                    initial={false}
                    animate={{ scaleX: current >= index ? 1 : 0 }}
                    transition={spring.moderate}
                  />
                </span>
              )}
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                onClick={() => setPane(step.value)}
                className={cn(
                  'flex h-8 items-center gap-2 rounded-full pl-1 pr-3 outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)]',
                  typeClass('body'),
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full tabular-nums transition-colors',
                    typeClass('caption'),
                    active || done ? 'bg-foreground text-background' : 'text-muted-foreground ring-1 ring-inset ring-border',
                  )}
                >
                  {index + 1}
                </span>
                {step.label}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** The current step's settings, sliding in from the side the step comes from. */
function PaneSettings({ autoFocus }: { autoFocus: boolean }) {
  const { pane } = useEditor()
  const reduced = useReducedMotion()
  // Each step starts at its top.
  useEffect(() => {
    document.querySelectorAll('[data-pane-scroll]').forEach((el) => el.scrollTo({ top: 0 }))
  }, [pane])
  // The first field takes the focus on load only, not on each return to Stamp.
  const firstLoad = useRef(true)
  useEffect(() => {
    firstLoad.current = false
  }, [])
  const dir = pane === 'pop' ? 1 : -1
  const offset = reduced ? 0 : 24
  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div
        key={pane}
        role="region"
        aria-label={pane === 'stamp' ? 'Stamp settings' : 'Pop settings'}
        custom={dir}
        variants={{
          enter: (d: number) => ({ x: d * offset, opacity: 0 }),
          center: { x: 0, opacity: 1 },
          leave: (d: number) => ({ x: -d * offset, opacity: 0, transition: spring.moderate.exit }),
        }}
        initial="enter"
        animate="center"
        exit="leave"
        transition={spring.moderate}
      >
        {pane === 'stamp' ? <SettingsPanel autoFocus={autoFocus && firstLoad.current} /> : <ProfilePanel />}
      </motion.div>
    </AnimatePresence>
  )
}

/** The badge on the backdrop, or the modal it opens, grown out of the badge's place. */
function PaneStage({ showHint = true, className }: { showHint?: boolean; className?: string }) {
  const { pane } = useEditor()
  const reduced = useReducedMotion()
  const pop = pane === 'pop'
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pane}
        className={cn('flex min-h-0 flex-col', className)}
        initial={reduced ? { opacity: 0 } : pop ? { opacity: 0, scale: 0.4 } : { opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduced ? { opacity: 0 } : pop ? { opacity: 0, scale: 0.4, transition: spring.slow.exit } : { opacity: 0, scale: 1.15, transition: spring.fast.exit }}
        transition={pop ? spring.slow : spring.moderate}
      >
        {pop ? <ProfileStage className="flex-1" /> : <PreviewStage showHint={showHint} className="flex-1" />}
      </motion.div>
    </AnimatePresence>
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
  // Hidden until the observer says the editor is on screen (no flash on the home page).
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [tablet])

  if (!tablet) {
    return (
      // The room left for the transparent header takes the preview grey, not white.
      <div ref={rootRef} className="flex h-dvh flex-col pt-14" style={backdrop}>
        <div className="flex h-[35dvh] min-h-44 shrink-0 flex-col overflow-hidden border-b border-border" style={backdrop}>
          <PaneStage showHint={false} className="flex-1" />
        </div>
        {/* Same surface level as the desktop cards, so menus opened from it land on the same step. */}
        <Elevated offset={2} aria-label="Settings" role="region" className="min-h-0 flex-1 overflow-y-auto" data-pane-scroll>
          <div className="sticky top-0 z-10 border-b border-border bg-inherit px-3 py-2">
            <PaneStepper />
          </div>
          <PaneSettings autoFocus={autoFocus} />
          <div className="flex justify-center px-3 pb-24 pt-2">
            <ResetButton />
          </div>
        </Elevated>
        {/* Only while the editor is on screen (it sits under the home page). */}
        {inView && <ExportSheet />}
      </div>
    )
  }

  const settings = (
    <Card label="Settings" className="h-full">
      <div className="shrink-0 border-b border-border px-3 py-2">
        <PaneStepper />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" data-pane-scroll>
        <PaneSettings autoFocus={autoFocus} />
      </div>
      <div className="flex shrink-0 justify-center border-t border-border px-3 py-2">
        <ResetButton />
      </div>
    </Card>
  )

  const center = (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneStage className="flex-1" />
    </div>
  )

  return (
    <div ref={rootRef} className="h-dvh overflow-hidden" style={backdrop}>
      <div className="grid h-full grid-cols-[minmax(300px,360px)_1fr] gap-4 px-4 pb-4 pt-16 lg:grid-cols-[360px_1fr_300px]">
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
