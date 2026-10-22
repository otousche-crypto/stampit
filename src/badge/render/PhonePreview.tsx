import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'

/** iPhone-sized viewport (CSS px). */
const PHONE = { width: 375, height: 667 }
/** How long the intercepted link shows. Not an animation timing. */
const LINK_TIP_MS = 2400

/**
 * The snippet in a real 375 px viewport (an iframe), so the badge and its
 * bubbles lay out exactly as on a phone. Links never leave the editor.
 */
export function PhonePreview({ code, backdrop, dark }: { code: string; backdrop: string; dark: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)
  const [tip, setTip] = useState<string | null>(null)

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;background:${backdrop};color-scheme:${dark ? 'dark' : 'light'}}body{display:grid;place-items:center}</style></head><body>${code}</body></html>`,
    [code, backdrop, dark],
  )

  // Fit the phone in the available height.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => setScale(Math.min(1, (el.clientHeight - 72) / (PHONE.height + 24), (el.clientWidth - 24) / (PHONE.width + 24)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onLoad = () => {
    const doc = frameRef.current?.contentDocument
    doc?.addEventListener(
      'click',
      (e) => {
        const link = (e.target as Element | null)?.closest?.('a[href]')
        if (!link) return
        e.preventDefault()
        const url = link.getAttribute('href') ?? ''
        setTip(url === '#' ? 'No link yet' : url)
      },
      true,
    )
  }

  useEffect(() => {
    if (!tip) return
    const t = window.setTimeout(() => setTip(null), LINK_TIP_MS)
    return () => window.clearTimeout(t)
  }, [tip])

  return (
    <div ref={wrapRef} className="relative flex h-full w-full items-center justify-center pb-6">
      <div
        className="overflow-hidden rounded-[44px] bg-black p-3 shadow-xl"
        style={{ width: PHONE.width + 24, height: PHONE.height + 24, zoom: scale }}
      >
        <iframe
          ref={frameRef}
          title="Phone preview"
          srcDoc={srcDoc}
          onLoad={onLoad}
          className="block h-full w-full rounded-[32px] border-0"
          style={{ background: backdrop }}
        />
      </div>
      <p
        aria-live="polite"
        className={cn(
          'pointer-events-none absolute bottom-3 left-0 right-0 truncate px-4 text-center',
          typeClass('caption'),
          dark ? 'text-white/60' : 'text-black/55',
        )}
      >
        {tip ? `Link: ${tip}` : 'Links are disabled in the preview.'}
      </p>
    </div>
  )
}
