import { useRef, type KeyboardEvent } from 'react'
import { AVATARS, AVATAR_BACKGROUND } from '@/badge/avatars'
import { deriveInitials, initialsColor } from '@/badge/export/generateHtml'
import { DEFAULT_AVATAR_BACKGROUND } from '@/badge/schema'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { useEditor } from '../EditorProvider'

/** Initials first, then the built-in avatars. */
const OPTIONS = [{ id: 'initials', name: 'Initials', src: null }, ...AVATARS]

/** Tiles per row, for Up / Down. Matches `grid-cols-6`. */
const COLUMNS = 6

/** Pick an avatar from the list, or initials. No photo upload. */
export function AvatarSection() {
  const { config, update, editingPalette } = useEditor()
  const { source, url } = config.avatar
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  // An older link may point at another image: then nothing is selected.
  const selectedIndex = source === 'url' ? OPTIONS.findIndex((o) => o.src === url) : 0
  const focusIndex = Math.max(0, selectedIndex)

  const select = (index: number) => {
    const { src } = OPTIONS[index]
    update((c) => ({
      ...c,
      avatar: src
        ? { ...c.avatar, source: 'url', url: src, background: AVATAR_BACKGROUND }
        : { ...c.avatar, source: 'initials', url: null, background: DEFAULT_AVATAR_BACKGROUND },
    }))
  }

  // Radio group keyboard, on a grid: arrows move the selection and the focus.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS }[e.key]
    let next: number | null = step ? focusIndex + step : null
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = OPTIONS.length - 1
    if (next === null) return
    e.preventDefault()
    next = Math.min(Math.max(next, 0), OPTIONS.length - 1)
    select(next)
    buttons.current[next]?.focus()
  }

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <span id="avatar-label" className={cn('pl-2 text-muted-foreground', typeClass('body'))}>
        Avatar
      </span>
      <div role="radiogroup" aria-labelledby="avatar-label" className="grid grid-cols-6 gap-1.5 px-2" onKeyDown={onKeyDown}>
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
                'grid aspect-square w-full cursor-pointer place-items-center overflow-hidden rounded-full outline-none ring-offset-2 ring-offset-background transition-[box-shadow,opacity] duration-80',
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
    </div>
  )
}
