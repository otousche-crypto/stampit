import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AVATARS, AVATAR_BACKGROUND } from '@/badge/avatars'
import { deriveInitials, initialsColor } from '@/badge/export/generateHtml'
import { DEFAULT_AVATAR_BACKGROUND } from '@/badge/schema'
import { Button } from '@/components/ui/button'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { useEditor } from '../EditorProvider'

/** Initials first, then the built-in avatars. */
const OPTIONS = [{ id: 'initials', name: 'Initials', src: null }, ...AVATARS]

/** Edge fade on the side that still has avatars to scroll to. */
const FADE = 24

/** Pick an avatar from a carousel, or initials. No photo upload. */
export function AvatarSection() {
  const { config, update, editingPalette } = useEditor()
  const { source, url } = config.avatar
  const scroller = useRef<HTMLDivElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const [edges, setEdges] = useState({ start: true, end: false })

  // An older link may point at another image: then nothing is selected.
  const selectedIndex = source === 'url' ? OPTIONS.findIndex((o) => o.src === url) : 0
  const focusIndex = Math.max(0, selectedIndex)

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 })
  }, [])

  /** Scrolls the strip only: scrollIntoView would also scroll the page (the editor sits under the home page). */
  const reveal = (index: number, behavior: ScrollBehavior) => {
    const el = scroller.current
    const item = buttons.current[index]
    if (!el || !item) return
    const left = item.offsetLeft
    const target =
      left < el.scrollLeft + FADE
        ? left - FADE
        : left + item.offsetWidth > el.scrollLeft + el.clientWidth - FADE
          ? left + item.offsetWidth - el.clientWidth + FADE
          : el.scrollLeft
    el.scrollTo({ left: target, behavior })
  }
  const motionBehavior = (): ScrollBehavior =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  // The selected avatar starts in view (a reloaded badge may sit far along).
  useEffect(() => {
    reveal(focusIndex, 'auto')
    measure()
    // Mount only: later selections scroll themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const select = (index: number) => {
    const { src } = OPTIONS[index]
    update((c) => ({
      ...c,
      avatar: src
        ? { ...c.avatar, source: 'url', url: src, background: AVATAR_BACKGROUND }
        : { ...c.avatar, source: 'initials', url: null, background: DEFAULT_AVATAR_BACKGROUND },
    }))
    reveal(index, motionBehavior())
  }

  const page = (direction: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: motionBehavior() })
  }

  // Radio group keyboard: arrows move the selection and the focus.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    let next: number | null = step ? focusIndex + step : null
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = OPTIONS.length - 1
    if (next === null) return
    e.preventDefault()
    next = Math.min(Math.max(next, 0), OPTIONS.length - 1)
    select(next)
    buttons.current[next]?.focus({ preventScroll: true })
  }

  const mask = `linear-gradient(to right, ${edges.start ? '#000' : 'transparent'}, #000 ${FADE}px, #000 calc(100% - ${FADE}px), ${edges.end ? '#000' : 'transparent'})`

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <span id="avatar-label" className={cn('pl-2 text-muted-foreground', typeClass('body'))}>
        Avatar
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-compact"
          aria-label="Previous avatars"
          tabIndex={-1}
          disabled={edges.start}
          onClick={() => page(-1)}
        >
          <ChevronLeft />
        </Button>
        <div
          ref={scroller}
          role="radiogroup"
          aria-labelledby="avatar-label"
          onKeyDown={onKeyDown}
          onScroll={measure}
          className="relative flex min-w-0 flex-1 snap-x snap-proximity gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          {OPTIONS.map((option, index) => {
            const selected = index === selectedIndex
            return (
              <button
                key={option.id}
                ref={(node) => {
                  buttons.current[index] = node
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={option.name}
                title={option.name}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => select(index)}
                className={cn(
                  'grid size-10 shrink-0 cursor-pointer snap-start place-items-center overflow-hidden rounded-full outline-none ring-offset-2 ring-offset-background transition-[box-shadow,opacity] duration-80',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]',
                  selected ? 'ring-2 ring-foreground' : 'opacity-85 hover:opacity-100',
                )}
                style={{ background: option.src ? AVATAR_BACKGROUND : DEFAULT_AVATAR_BACKGROUND }}
              >
                {option.src ? (
                  <img src={option.src} alt="" width={96} height={96} className="size-full object-cover" draggable={false} />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn('font-semibold', typeClass('caption'))}
                    style={{ color: initialsColor({ ...config, avatar: { ...config.avatar, background: DEFAULT_AVATAR_BACKGROUND } }, editingPalette) }}
                  >
                    {deriveInitials(config)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <Button
          variant="ghost"
          size="icon-compact"
          aria-label="Next avatars"
          tabIndex={-1}
          disabled={edges.end}
          onClick={() => page(1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
