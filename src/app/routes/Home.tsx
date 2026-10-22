import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BadgePreview } from '@/badge/render/BadgePreview'
import { GITHUB_URL } from '@/config/site'
import { hasStoredConfig } from '@/storage/local'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { DEMO_HTML, DEMO_MODE } from '../demo.generated'

const ARGUMENTS = [
  {
    title: 'Yours, pixel by pixel.',
    body: 'Text, colors, avatar, radius. Light and dark, with a contrast check built in.',
  },
  {
    title: 'One click, all your links.',
    body: 'Turn the badge into a small menu of your socials: X, GitHub, LinkedIn, Dribbble…',
  },
  {
    title: 'Paste and forget.',
    body: 'Copy a prompt for your AI coding agent, or plain HTML/CSS. Lightweight, zero dependencies.',
  },
]

export function Home() {
  const [returning, setReturning] = useState(false)
  useEffect(() => setReturning(hasStoredConfig()), [])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between px-4 sm:px-6">
        <span className={cn('text-foreground', typeClass('title'))} style={{ fontVariationSettings: fontWeights.semibold }}>
          Stampit
        </span>
        <Button asChild variant="ghost" size="compact">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-8 sm:px-6">
        <div className="flex max-w-xl flex-col items-center gap-3 text-center">
          <h1 className={cn('text-foreground', typeClass('display'))} style={{ fontVariationSettings: fontWeights.bold }}>
            Make your own badge
          </h1>
          <p className={cn('text-foreground', typeClass('title'))}>Stamp everything you ship.</p>
          <p className={cn('max-w-md text-muted-foreground', typeClass('body'))}>
            A tiny, customizable badge for your footer. Style it, add your links, paste one snippet. No account, no
            dependency.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button asChild variant="primary" trailingIcon={ArrowRight}>
              <Link to="/create">{returning ? 'Continue editing' : 'Create'}</Link>
            </Button>
            <Button asChild variant="ghost">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        <figure className="flex flex-col items-center gap-4">
          <div className="flex min-h-24 items-center justify-center rounded-2xl bg-[#F2F2F7] px-8 py-6 ring-1 ring-black/5 dark:ring-white/10">
            <BadgePreview code={DEMO_HTML} scale={1.5} />
          </div>
          <figcaption className={cn('text-muted-foreground', typeClass('caption'))}>
            {DEMO_MODE === 'bubbles' ? '↑ Click it. Then make yours.' : '↑ Hover it. Then make yours.'}
          </figcaption>
        </figure>

        <ul className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {ARGUMENTS.map((arg) => (
            <li key={arg.title} className="flex flex-col gap-1 text-center sm:text-left">
              <h2 className={cn('text-foreground', typeClass('subtitle'))} style={{ fontVariationSettings: fontWeights.semibold }}>
                {arg.title}
              </h2>
              <p className={cn('text-muted-foreground', typeClass('body'))}>{arg.body}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
