import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Check, Copy } from 'lucide-react'
import { spring } from '@/lib/springs'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { WELL } from './controls'

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older Safari / insecure context.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

/** How long the check stays after a copy. Not an animation timing. */
const COPIED_MS = 1600

// Icon swap in one cell (Fluid recipe): the arriving glyph rides the tier's
// full duration, the leaving one its exit token.
const SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' }
const HIDDEN = { opacity: 0, scale: 0.6, filter: 'blur(4px)' }
const enter = { type: 'tween' as const, duration: spring.fast.duration, ease: 'easeOut' as const }
const leave = { type: 'tween' as const, ...spring.fast.exit, ease: 'easeIn' as const }

type CopyFieldProps = {
  /** What gets copied. */
  value: string
  /** What is shown (defaults to the raw value). */
  children?: ReactNode
  label: string
  disabled?: boolean
  className?: string
}

/** A read-only, scrollable text box with its copy button inside. */
export function CopyField({ value, children, label, disabled = false, className }: CopyFieldProps) {
  const [copied, setCopied] = useState<boolean | null>(null)

  useEffect(() => {
    if (copied === null) return
    const t = window.setTimeout(() => setCopied(null), COPIED_MS)
    return () => window.clearTimeout(t)
  }, [copied])

  return (
    <div className={cn(// A recessed well: darker than the card, inner ring and shadow, so it reads as a field.
      'relative flex min-h-0 flex-col overflow-hidden rounded-lg', WELL, className)}>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          // pb-12 lets the last lines scroll clear of the bottom fade.
          'min-h-0 flex-1 overflow-auto p-3 pt-10 pb-12 text-[11px] leading-[16px] outline-none [mask-image:linear-gradient(to_bottom,#000_calc(100%-48px),transparent)] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[color:var(--focus-ring)] [&_pre]:whitespace-pre-wrap [&_pre]:break-words',
          disabled && 'opacity-50',
        )}
      >
        {children ?? <pre className="font-mono">{value}</pre>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={async () => setCopied(await copyText(value))}
        className={cn(
          'absolute right-2 top-2 flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-background px-2 text-foreground shadow-sm ring-1 ring-border outline-none transition-colors hover:bg-hover focus-visible:ring-[color:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
          typeClass('caption'),
        )}
        style={{ fontVariationSettings: fontWeights.semibold, transitionDuration: `${spring.fast.duration}s` }}
      >
        <span className="grid size-3.5">
          <motion.span
            className="col-start-1 row-start-1 flex"
            initial={false}
            animate={copied ? HIDDEN : SHOWN}
            transition={copied ? leave : enter}
          >
            <Copy size={14} aria-hidden="true" />
          </motion.span>
          <motion.span
            className="col-start-1 row-start-1 flex"
            initial={false}
            animate={copied ? SHOWN : HIDDEN}
            transition={copied ? enter : leave}
          >
            <Check size={14} aria-hidden="true" />
          </motion.span>
        </span>
        Copy
        <span className="sr-only" aria-live="polite">
          {copied === true ? 'Copied' : copied === false ? "Couldn't copy" : ''}
        </span>
      </button>
    </div>
  )
}
