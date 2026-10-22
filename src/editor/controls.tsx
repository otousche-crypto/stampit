import { useId, type ReactNode } from 'react'
import { RadioGroup, RadioItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { IconComponent } from '@/lib/icon-context'
import { ColorPickerPopover } from '@/components/ui/color-picker'
import { Tooltip } from '@/components/ui/tooltip'
import { formatRatio, type ContrastIssue } from '@/badge/contrast'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/springs'

/** CSS transition length of Fluid's fast tier, for hand-written hover states. */
export const FAST_CSS = { transitionDuration: `${spring.fast.duration}s` } as const

/** Small caption above a control. */
export function FieldLabel({ children, id, htmlFor }: { children: ReactNode; id?: string; htmlFor?: string }) {
  return (
    <label id={id} htmlFor={htmlFor} className={cn('block text-muted-foreground px-2 pb-1', typeClass('caption'))}>
      {children}
    </label>
  )
}

export function Hint({ children, id, tone = 'muted' }: { children: ReactNode; id?: string; tone?: 'muted' | 'error' }) {
  return (
    <p
      id={id}
      className={cn(
        'px-2 pt-1',
        typeClass('caption'),
        tone === 'error' ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      {children}
    </p>
  )
}

export type ChoiceOption<T extends string> = { value: T; label: string }

/** A labelled Fluid RadioGroup. `value = null` shows no selection (custom preset). */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: ChoiceOption<T>[]
  value: T | null
  onChange: (value: T) => void
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('min-w-0', className)}>
      <FieldLabel id={id}>{label}</FieldLabel>
      <RadioGroup
        aria-labelledby={id}
        size="compact"
        className="w-full"
        selectedIndex={value === null ? -1 : options.findIndex((o) => o.value === value)}
      >
        {options.map((option, index) => (
          <RadioItem
            key={option.value}
            index={index}
            label={option.label}
            selected={option.value === value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </RadioGroup>
    </div>
  )
}

/** Normalise the picker's hex to "#RRGGBB" / "#RRGGBBAA", upper-case; opaque alpha dropped. */
export function normalizeHex(input: string): string | null {
  let h = input.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(h)) return null
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
  if (h.length !== 6 && h.length !== 8) return null
  h = h.toUpperCase()
  if (h.length === 8 && h.endsWith('FF')) h = h.slice(0, 6)
  return `#${h}`
}

/** ColorPicker row with the live contrast dot (§6.3). */
export function ColorField({
  label,
  value,
  onChange,
  issue,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
  issue?: ContrastIssue
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 min-w-0 [&>div]:flex [&>div]:w-full">
      <ColorPickerPopover
        size="compact"
        triggerLabel={label}
        triggerClassName="w-full justify-between"
        value={value}
        onValueChange={(_, parsed) => {
          const hex = normalizeHex(parsed.hex)
          if (hex && hex !== value) onChange(hex)
        }}
      />
      </div>
      <span className="flex w-4 shrink-0 justify-center">
        {issue && (
          <Tooltip content={`${formatRatio(issue.ratio)} · needs ${issue.required}:1`} delayDuration={0}>
            <button
              type="button"
              className="size-2.5 rounded-full bg-destructive outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2"
              aria-label={`${label} contrast ${formatRatio(issue.ratio)}, needs ${issue.required}:1`}
            />
          </Tooltip>
        )}
      </span>
    </div>
  )
}

/** Clickable text suggestions under a field. */
export function Suggestions({
  items,
  onPick,
  label,
}: {
  items: string[]
  onPick: (value: string) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 px-1 pt-1.5">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className={cn(
            'rounded-full px-2 py-0.5 text-muted-foreground bg-hover hover:bg-active hover:text-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)] cursor-pointer',
            typeClass('caption'),
          )}
          style={{ fontVariationSettings: fontWeights.normal, ...FAST_CSS }}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export type SelectRowOption<T extends string> = { value: T; label: string; icon?: IconComponent }

/** Settings row: muted label on the left, a borderless select on the right. */
export function SelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Custom',
}: {
  label: string
  options: SelectRowOption<T>[]
  value: T | null
  onChange: (value: T) => void
  placeholder?: string
}) {
  const id = useId()
  const current = options.find((o) => o.value === value)
  return (
    <div className="flex min-h-9 items-center justify-between gap-2 pl-2">
      <span id={id} className={cn('text-muted-foreground', typeClass('body'))}>
        {label}
      </span>
      <Select size="default" value={value ?? ''} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger
          variant="borderless"
          aria-labelledby={id}
          icon={current?.icon}
          placeholder={placeholder}
          className="w-auto min-w-0"
        />
        <SelectContent>
          {options.map((o, i) => (
            <SelectItem key={o.value} index={i} value={o.value} icon={o.icon}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Settings row with a switch on the right (Fluid Switch, label first). */
export function SwitchRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Switch
      label={label}
      checked={checked}
      onToggle={onToggle}
      size="default"
      className="min-h-9 w-full flex-row-reverse justify-between pr-2 pl-2"
    />
  )
}
