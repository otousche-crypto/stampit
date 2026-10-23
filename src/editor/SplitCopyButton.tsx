import { useEffect, useState } from 'react'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownContent, DropdownLabel, DropdownMenu, DropdownTrigger } from '@/components/ui/dropdown'
import { MenuItem } from '@/components/ui/menu-item'
import { copyText } from './CopyField'

/** How long "Copied" stays on the button. Not an animation timing. */
const COPIED_MS = 1600

type Option = { value: string; label: string }

/**
 * A primary "Copy …" button joined to a chevron that opens a Fluid dropdown.
 * Picking an option selects it and copies its version at once; the main
 * button copies the selected one.
 */
export function SplitCopyButton<T extends string>({
  label,
  icon,
  menuLabel,
  options,
  selected,
  onSelect,
  valueFor,
  blocked = false,
  onBlocked,
}: {
  label: string
  icon: LucideIcon
  menuLabel: string
  options: (Option & { value: T })[]
  /** null: nothing picked yet (the neutral version). */
  selected: T | null
  onSelect: (value: T) => void
  /** The text to copy for an option (or the neutral version). */
  valueFor: (value: T | null) => string
  /** Something must be fixed first: clicks don't copy, they call onBlocked. */
  blocked?: boolean
  onBlocked?: () => void
}) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(t)
  }, [copied])

  const copy = async (value: T | null) => {
    if (blocked) {
      onBlocked?.()
      return
    }
    setCopied(await copyText(valueFor(value)))
  }
  const checkedIndex = selected === null ? undefined : options.findIndex((o) => o.value === selected)

  return (
    <div className="flex items-stretch gap-px">
      <Button
        variant="primary"
        size="compact"
        leadingIcon={copied ? Check : icon}
        className="flex-1 rounded-r-none"
        onClick={() => copy(selected)}
      >
        {copied ? 'Copied' : label}
      </Button>
      <DropdownMenu size="compact">
        <DropdownTrigger
          render={
            <Button variant="primary" size="icon-compact" className="rounded-l-none" aria-label={menuLabel}>
              <ChevronDown />
            </Button>
          }
        />
        <DropdownContent align="end" checkedIndex={checkedIndex}>
          <DropdownLabel>{menuLabel}</DropdownLabel>
          {options.map((option, index) => (
            <MenuItem
              key={option.value}
              index={index}
              label={option.label}
              checked={option.value === selected}
              onSelect={() => {
                onSelect(option.value)
                void copy(option.value)
              }}
            />
          ))}
        </DropdownContent>
      </DropdownMenu>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </div>
  )
}
