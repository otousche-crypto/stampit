import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Layout } from '@/badge/schema'
import { useFluidHover } from '@/hooks/use-fluid-hover'
import { useShape } from '@/lib/shape-context'
import { useSurface } from '@/lib/surface-context'
import { surfaceClasses } from '@/lib/surface-classes'
import { spring } from '@/lib/springs'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { useEditor } from '../EditorProvider'

/** Ring in a surface's own color, so overlapping avatars read as cut out of it. Literal classes for Tailwind. */
const SURFACE_RING: Record<number, string> = {
  1: 'ring-surface-1',
  2: 'ring-surface-2',
  3: 'ring-surface-3',
  4: 'ring-surface-4',
  5: 'ring-surface-5',
  6: 'ring-surface-6',
  7: 'ring-surface-7',
  8: 'ring-surface-8',
}

/** A miniature badge sits one step above the panel it is drawn on (Fluid surface ladder). */
const useThumbLevel = () => Math.min(useSurface() + 1, 8)

/** Thumbnail primitives: a surface, an avatar dot and text lines, in the current text color. */
const Surface = ({ className, children }: { className?: string; children: ReactNode }) => (
  <span className={cn('flex items-center', surfaceClasses(useThumbLevel()), className)}>{children}</span>
)
const StackDot = ({ className }: { className?: string }) => (
  <Dot className={cn('-ml-1 ring-1', SURFACE_RING[useThumbLevel()], className)} />
)
const Dot = ({ className }: { className?: string }) => <span className={cn('size-2.5 shrink-0 rounded-full bg-[#FF6B35]', className)} />
const Line = ({ className }: { className?: string }) => <span className={cn('h-[3px] shrink-0 rounded-full bg-current', className)} />

const THUMBS: Record<Layout, ReactNode> = {
  pill: (
    <Surface className="h-4 gap-[3px] rounded-full pl-0.5 pr-1.5">
      <Dot />
      <Line className="w-2.5 opacity-40" />
      <Line className="w-3.5" />
    </Surface>
  ),
  stamp: (
    <span className="grid size-7 place-items-center rounded-full border border-dashed border-current/50">
      <Dot className="size-3" />
    </span>
  ),
  split: (
    <Surface className="h-4 overflow-hidden rounded-full">
      <span className="flex h-full items-center px-1">
        <Line className="w-2.5 opacity-40" />
      </span>
      <span className="flex h-full items-center bg-foreground px-1">
        <Line className="w-3.5 text-background" />
      </span>
    </Surface>
  ),
  card: (
    <Surface className="h-7 w-10 gap-1 rounded-md px-1">
      <Dot className="size-3" />
      <span className="flex flex-col gap-0.5">
        <Line className="w-5" />
        <Line className="w-3 opacity-40" />
      </span>
    </Surface>
  ),
  team: (
    <Surface className="h-4 gap-1 rounded-full pl-0.5 pr-1.5">
      <span className="flex">
        <Dot />
        <StackDot className="bg-[#5B8DEF]" />
        <StackDot className="bg-[#3BB273]" />
      </span>
      <Line className="w-3" />
    </Surface>
  ),
}

const LABELS: Record<Layout, string> = {
  pill: 'Pill',
  stamp: 'Stamp',
  split: 'Label',
  card: 'Card',
  team: 'Team',
}

const ORDER: Layout[] = ['pill', 'stamp', 'split', 'card', 'team']

/**
 * The badge model, as a strip of thumbnails. Fluid's selection pattern (as in
 * TabsSubtle): one selected background and one hover background glide between
 * items on the DS springs, a focus ring follows the keyboard, and the label
 * reserves its semibold width so selecting never shifts it.
 */
export function LayoutSection() {
  const { config, update } = useEditor()
  const shape = useShape()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const [mouseInside, setMouseInside] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const { activeIndex: hoveredIndex, setActiveIndex: setHoveredIndex, itemRects, isMeasured, handlers, registerItem } =
    useFluidHover(containerRef, { axis: 'x' })

  // Registered once, like TabsSubtle's tabs: an inline ref callback would re-register every render.
  useEffect(() => {
    buttons.current.forEach((node, index) => registerItem(index, node))
    return () => ORDER.forEach((_, index) => registerItem(index, null))
  }, [registerItem])

  const selectedIndex = Math.max(0, ORDER.indexOf(config.layout))
  const select = (index: number) => update((c) => ({ ...c, layout: ORDER[index] }))

  const selectedRect = isMeasured ? itemRects[selectedIndex] : undefined
  const hoverRect = isMeasured && hoveredIndex !== null ? itemRects[hoveredIndex] : undefined
  const focusRect = isMeasured && focusedIndex !== null ? itemRects[focusedIndex] : undefined
  const isHovering = hoveredIndex !== null && hoveredIndex !== selectedIndex

  // Radio group keyboard: arrows move the selection and the focus, wrapping.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    let next: number | null = step ? (selectedIndex + step + ORDER.length) % ORDER.length : null
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = ORDER.length - 1
    if (next === null) return
    e.preventDefault()
    select(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Style"
      className="relative grid grid-cols-5 gap-1"
      onMouseMove={(e) => {
        setMouseInside(true)
        handlers.onMouseMove(e)
      }}
      onMouseLeave={() => {
        setMouseInside(false)
        handlers.onMouseLeave()
      }}
      onClick={handlers.onClick}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        const index = Number((e.target as HTMLElement).closest('[data-fluid-hover-index]')?.getAttribute('data-fluid-hover-index'))
        if (Number.isNaN(index)) return
        setHoveredIndex(index)
        setFocusedIndex((e.target as HTMLElement).matches(':focus-visible') ? index : null)
      }}
      onBlur={(e) => {
        if (containerRef.current?.contains(e.relatedTarget as Node)) return
        setFocusedIndex(null)
        if (!mouseInside) setHoveredIndex(null)
      }}
    >
      {/* Selected background */}
      {selectedRect && (
        <motion.div
          aria-hidden="true"
          className={cn('pointer-events-none absolute bg-active', shape.bg)}
          initial={false}
          animate={{ ...selectedRect, opacity: isHovering ? 0.8 : 1 }}
          transition={{ ...spring.moderate, opacity: { duration: 0.08 } }}
        />
      )}

      {/* Hover background: leaves from the selected item, returns to it */}
      <AnimatePresence>
        {hoverRect && isHovering && selectedRect && (
          <motion.div
            aria-hidden="true"
            className={cn('pointer-events-none absolute bg-active', shape.bg)}
            initial={{ ...selectedRect, opacity: 0 }}
            animate={{ ...hoverRect, opacity: 0.4 }}
            exit={
              mouseInside
                ? { opacity: 0, transition: spring.fast.exit }
                : { ...selectedRect, opacity: 0, transition: { ...spring.moderate, opacity: { duration: 0.06 } } }
            }
            transition={{ ...spring.fast, opacity: { duration: 0.08 } }}
          />
        )}
      </AnimatePresence>

      {/* Focus ring */}
      <AnimatePresence>
        {focusRect && (
          <motion.div
            aria-hidden="true"
            className={cn('pointer-events-none absolute z-20 border border-[color:var(--focus-ring,#6B97FF)]', shape.focusRing)}
            initial={false}
            animate={{
              left: focusRect.left - 2,
              top: focusRect.top - 2,
              width: focusRect.width + 4,
              height: focusRect.height + 4,
            }}
            exit={{ opacity: 0, transition: spring.fast.exit }}
            transition={{ ...spring.fast, opacity: { duration: 0.08 } }}
          />
        )}
      </AnimatePresence>

      {ORDER.map((layout, index) => {
        const selected = index === selectedIndex
        const active = selected || hoveredIndex === index
        return (
          <button
            key={layout}
            ref={(node) => {
              buttons.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-fluid-hover-index={index}
            onClick={() => select(index)}
            className={cn(
              'relative z-10 flex min-w-0 cursor-pointer flex-col items-center gap-1.5 overflow-hidden px-1 pb-2 pt-2.5 outline-none',
              shape.bg,
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-7 items-center justify-center transition-opacity duration-80',
                active ? 'text-foreground/70 opacity-100' : 'text-foreground/70 opacity-80',
              )}
            >
              {THUMBS[layout]}
            </span>
            {/* The invisible semibold copy reserves the width: no shift on select. */}
            <span className={cn('inline-grid whitespace-nowrap', typeClass('caption'))}>
              <span className="invisible col-start-1 row-start-1" style={{ fontVariationSettings: fontWeights.semibold }}>
                {LABELS[layout]}
              </span>
              <span
                className={cn(
                  'col-start-1 row-start-1 text-center transition-[color,font-variation-settings] duration-80',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
                style={{ fontVariationSettings: selected ? fontWeights.semibold : fontWeights.normal }}
              >
                {LABELS[layout]}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
