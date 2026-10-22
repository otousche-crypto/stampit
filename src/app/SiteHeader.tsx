import { Link, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { CHANNELS } from '@/badge/channels'
import { GITHUB_URL } from '@/config/site'
import type { IconComponentProps } from '@/lib/icon-context'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { AppearanceSwitch } from './AppearanceSwitch'

/** Height of the fixed header; pages leave this much room at the top. */
export const HEADER_HEIGHT = 'h-14'

function GithubIcon({ size = 16, className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d={CHANNELS.github.icon.d} />
    </svg>
  )
}

/** Stampit · Light / Dark · GitHub, fixed on top of every page while scrolling. */
export function SiteHeader() {
  const { pathname } = useLocation()
  return (
    <header
      className={cn(
        // Frosted, in the page grey, so content scrolling underneath stays out of the way.
        'fixed inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center bg-[#F2F2F7]/80 px-4 backdrop-blur-md sm:px-6 dark:bg-background/80',
        HEADER_HEIGHT,
      )}
    >
      <Link
        to="/"
        onClick={() => pathname === '/' && window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn('pointer-events-auto justify-self-start rounded-md px-1 text-foreground', typeClass('title'))}
        style={{ fontVariationSettings: fontWeights.semibold }}
      >
        Stampit
      </Link>
      <AppearanceSwitch />
      <Button asChild variant="ghost" size="compact" leadingIcon={GithubIcon} className="pointer-events-auto justify-self-end">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          {/* Icon only on phones, where the Light / Dark switch takes the middle. */}
          <span className="max-sm:sr-only">View on GitHub</span>
        </a>
      </Button>
    </header>
  )
}
