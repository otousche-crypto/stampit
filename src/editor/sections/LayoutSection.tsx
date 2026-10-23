import type { ReactNode } from 'react'
import type { Layout } from '@/badge/schema'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { FAST_CSS } from '../controls'
import { useEditor } from '../EditorProvider'

/** Thumbnail primitives: a surface, an avatar dot and text lines, in the current text color. */
const Surface = ({ className, children }: { className?: string; children: ReactNode }) => (
  <span className={cn('flex items-center bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)] dark:bg-white/10', className)}>
    {children}
  </span>
)
const Dot = ({ className }: { className?: string }) => <span className={cn('size-2.5 shrink-0 rounded-full bg-[#FF6B35]', className)} />
const Line = ({ className }: { className?: string }) => <span className={cn('h-[3px] shrink-0 rounded-full bg-current', className)} />

const THUMBS: Record<Layout, ReactNode> = {
  pill: (
    <Surface className="h-4 gap-1 rounded-full pl-0.5 pr-1.5">
      <Dot />
      <Line className="w-4 opacity-40" />
      <Line className="w-5" />
    </Surface>
  ),
  text: (
    <span className="flex items-center gap-1">
      <Line className="w-4 opacity-40" />
      <Line className="w-6 shadow-[0_2px_0_currentColor]" />
    </span>
  ),
  avatar: (
    <Surface className="size-4 justify-center rounded-full">
      <Dot />
    </Surface>
  ),
  stamp: (
    <span className="grid size-7 place-items-center rounded-full border border-dashed border-current/50">
      <Dot className="size-3" />
    </span>
  ),
  split: (
    <span className="flex h-4 overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
      <span className="flex items-center bg-background px-1.5 dark:bg-white/10">
        <Line className="w-3 opacity-40" />
      </span>
      <span className="flex items-center bg-foreground px-1.5">
        <Line className="w-4 text-background" />
      </span>
    </span>
  ),
  floating: (
    <span className="relative h-7 w-12 rounded-[4px] border border-current/20">
      <Surface className="absolute bottom-0.5 right-0.5 h-2.5 gap-0.5 rounded-full pl-px pr-1">
        <Dot className="size-1.5" />
        <Line className="h-[2px] w-3" />
      </Surface>
    </span>
  ),
  card: (
    <Surface className="h-7 w-12 gap-1 rounded-md px-1">
      <Dot className="size-3" />
      <span className="flex flex-col gap-0.5">
        <Line className="w-5" />
        <Line className="w-3 opacity-40" />
      </span>
    </Surface>
  ),
  status: (
    <Surface className="h-4 gap-1 rounded-full pl-1 pr-1.5">
      <span className="size-1.5 rounded-full bg-[#22C55E]" />
      <Line className="w-4" />
      <Line className="w-3 opacity-40" />
    </Surface>
  ),
  team: (
    <Surface className="h-4 gap-1 rounded-full pl-0.5 pr-1.5">
      <span className="flex">
        <Dot />
        <Dot className="-ml-1 bg-[#5B8DEF] ring-1 ring-background" />
        <Dot className="-ml-1 bg-[#3BB273] ring-1 ring-background" />
      </span>
      <Line className="w-5" />
    </Surface>
  ),
}

const LABELS: Record<Layout, string> = {
  pill: 'Pill',
  text: 'Text link',
  avatar: 'Avatar',
  stamp: 'Stamp',
  split: 'Label',
  floating: 'Floating',
  card: 'Card',
  status: 'Status',
  team: 'Team',
}

const ORDER: Layout[] = ['pill', 'text', 'avatar', 'stamp', 'split', 'floating', 'card', 'status', 'team']

/** The badge model, as a grid of thumbnails. */
export function LayoutSection() {
  const { config, update } = useEditor()
  return (
    <div role="radiogroup" aria-label="Style" className="grid grid-cols-3 gap-1.5">
      {ORDER.map((layout) => {
        const selected = config.layout === layout
        return (
          <button
            key={layout}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => update((c) => ({ ...c, layout }))}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg px-1 pb-1.5 pt-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]',
              selected ? 'bg-active text-foreground ring-1 ring-inset ring-foreground/15' : 'text-muted-foreground hover:bg-hover hover:text-foreground',
            )}
            style={FAST_CSS}
          >
            <span aria-hidden="true" className="flex h-7 items-center justify-center text-foreground/70">
              {THUMBS[layout]}
            </span>
            <span className={typeClass('caption')} style={{ fontVariationSettings: selected ? fontWeights.semibold : fontWeights.normal }}>
              {LABELS[layout]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
