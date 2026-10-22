import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type BadgePreviewProps = {
  /** Output of generateHtml(): comment + style + markup (+ script). */
  code: string
  /** Editor: clicks on links never leave the page; the target URL shows in a tooltip. */
  interceptLinks?: boolean
  /** Rendering scale, applied with CSS `zoom` so the badge's own positioning stays exact. */
  scale?: number
  className?: string
  style?: CSSProperties
}

/** How long the intercepted-link tooltip stays up. Not an animation timing. */
const LINK_TIP_MS = 2400

/**
 * Injects the generated snippet as-is, scripts included. This is the real
 * export, not a React re-implementation: what you see is what you copy.
 */
export function BadgePreview({ code, interceptLinks = false, scale = 1, className, style }: BadgePreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ url: string; rect: DOMRect } | null>(null)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    host.innerHTML = code
    // Scripts set through innerHTML don't run: recreate them.
    host.querySelectorAll('script').forEach((old) => {
      const script = document.createElement('script')
      script.textContent = old.textContent
      old.replaceWith(script)
    })
    return () => {
      host.querySelectorAll<HTMLElement>('[popover]').forEach((el) => {
        try {
          el.hidePopover()
        } catch {
          /* not open, or no popover support */
        }
      })
    }
  }, [code])

  useEffect(() => {
    const host = hostRef.current
    if (!host || !interceptLinks) return
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]')
      if (!link || !host.contains(link)) return
      event.preventDefault()
      const url = link.getAttribute('href') ?? ''
      setTip({ url: url === '#' ? 'No link yet' : url, rect: link.getBoundingClientRect() })
    }
    host.addEventListener('click', onClick, true)
    return () => host.removeEventListener('click', onClick, true)
  }, [interceptLinks])

  useEffect(() => {
    if (!tip) return
    const timer = window.setTimeout(() => setTip(null), LINK_TIP_MS)
    const close = () => setTip(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [tip])

  return (
    <>
      <div ref={hostRef} className={cn('inline-block', className)} style={{ ...style, zoom: scale }} />
      {tip &&
        createPortal(
          <Tooltip content={<span className="break-all">{tip.url}</span>} forceOpen side="top">
            <span
              aria-hidden="true"
              className="pointer-events-none fixed"
              style={{ left: tip.rect.left, top: tip.rect.top, width: tip.rect.width, height: tip.rect.height }}
            />
          </Tooltip>,
          document.body,
        )}
      {interceptLinks && (
        <span className="sr-only" aria-live="polite">
          {tip ? `Link: ${tip.url}` : ''}
        </span>
      )}
    </>
  )
}
