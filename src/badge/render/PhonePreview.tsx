import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'

/** iPhone 16: 393 × 852 CSS px, 6.1" with Dynamic Island. */
const PHONE = { width: 393, height: 852 }
const BEZEL = 12
const STATUS_BAR = 54
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
    const fit = () => setScale(Math.min(1, (el.clientHeight - 72) / (PHONE.height + 2 * BEZEL), (el.clientWidth - 24) / (PHONE.width + 2 * BEZEL)))
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
        className="relative overflow-hidden rounded-[64px] bg-[#1a1a1c] shadow-2xl ring-1 ring-black/40"
        style={{ width: PHONE.width + 2 * BEZEL, height: PHONE.height + 2 * BEZEL, padding: BEZEL, zoom: scale }}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[52px]" style={{ background: backdrop }}>
          <StatusBar dark={dark} />
          <iframe
            ref={frameRef}
            title="Phone preview"
            srcDoc={srcDoc}
            onLoad={onLoad}
            className="block min-h-0 w-full flex-1 border-0"
            style={{ background: backdrop }}
          />
        </div>
        {/* Dynamic Island */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black"
          style={{ top: BEZEL + 11 }}
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

/** iOS status bar: time on the left, signal, Wi-Fi and battery on the right. */
function StatusBar({ dark }: { dark: boolean }) {
  const fg = dark ? '#fff' : '#000'
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-between px-8 pt-1"
      style={{ height: STATUS_BAR, color: fg }}
    >
      <span className="w-[54px] text-center text-[17px] font-semibold tracking-tight" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
        9:41
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.4c2.2 0 4.2.9 5.7 2.3l1.1-1.1A9.6 9.6 0 0 0 8 .8 9.6 9.6 0 0 0 1.2 3.6l1.1 1.1A8 8 0 0 1 8 2.4Zm0 3.2c1.3 0 2.5.5 3.4 1.3l1.1-1.1A6.4 6.4 0 0 0 8 4a6.4 6.4 0 0 0-4.5 1.8l1.1 1.1c.9-.8 2.1-1.3 3.4-1.3Zm0 3.2c-.5 0-.9.2-1.2.5L8 10.5l1.2-1.2c-.3-.3-.7-.5-1.2-.5Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".35" />
          <rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".4" />
        </svg>
      </span>
    </div>
  )
}
