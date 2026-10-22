import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { skeletonPage } from './skeleton'

/**
 * Real viewports, in CSS px: MacBook Air 13" at its default "looks like"
 * resolution (1470 × 956, minus the menu bar and Safari's toolbar), and an
 * iPhone 16 (393 × 852). Both have close to the same physical density, so
 * the badge keeps its true size relative to each screen.
 */
const MAC = { width: 1470, height: 956, bezel: 16, menuBar: 24, toolbar: 52 }
const IPHONE = { width: 393, height: 852, bezel: 12, statusBar: 54 }

/** How long an intercepted link shows. Not an animation timing. */
const LINK_TIP_MS = 2400

type DevicePreviewProps = {
  device: 'desktop' | 'mobile'
  code: string
  backdrop: string
  dark: boolean
  /** 1 = the whole device fits; 2 = zoomed in on the footer, where the badge is. */
  zoom: 1 | 2
}

export function DevicePreview({ device, code, backdrop, dark, zoom }: DevicePreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [fit, setFit] = useState(0.3)
  const [tip, setTip] = useState<string | null>(null)

  const mac = device === 'desktop'
  const outer = mac
    ? { width: MAC.width + 2 * MAC.bezel, height: MAC.height + MAC.bezel }
    : { width: IPHONE.width + 2 * IPHONE.bezel, height: IPHONE.height + 2 * IPHONE.bezel }

  const srcDoc = useMemo(() => skeletonPage({ code, backdrop, dark, device }), [code, backdrop, dark, device])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () =>
      setFit(Math.min((el.clientWidth - 32) / outer.width, (el.clientHeight - 48) / outer.height))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [outer.width, outer.height])

  const onLoad = () => {
    frameRef.current?.contentDocument?.addEventListener(
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

  const scale = fit * zoom
  const chrome = dark
    ? { menu: '#1b1b1d', menuText: 'rgba(255,255,255,.85)', bar: '#2a2a2d', field: '#1c1c1e', text: 'rgba(255,255,255,.55)', line: 'rgba(255,255,255,.08)' }
    : { menu: '#f6f6f8', menuText: 'rgba(0,0,0,.85)', bar: '#ececef', field: '#ffffff', text: 'rgba(0,0,0,.5)', line: 'rgba(0,0,0,.08)' }
  const system = { fontFamily: '-apple-system, system-ui, sans-serif' }

  const iframe = (
    <iframe
      ref={frameRef}
      title={mac ? 'Desktop preview' : 'Phone preview'}
      srcDoc={srcDoc}
      onLoad={onLoad}
      className="block min-h-0 w-full flex-1 border-0"
      style={{ background: backdrop }}
    />
  )

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      {/* Zoom anchors on the footer: bottom centre of the device. */}
      <div
        className="absolute bottom-10 left-1/2"
        style={{ width: outer.width, height: outer.height, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'bottom center' }}
      >
        {mac ? (
          <div
            className="relative flex h-full flex-col rounded-t-[28px] bg-[#0e0e10] shadow-2xl ring-1 ring-black/40"
            style={{ padding: `${MAC.bezel}px ${MAC.bezel}px 0` }}
          >
            <div aria-hidden="true" className="absolute left-1/2 top-0 h-[40px] w-[200px] -translate-x-1/2 rounded-b-[14px] bg-[#0e0e10]">
              <span className="absolute left-1/2 top-[16px] size-[8px] -translate-x-1/2 rounded-full bg-[#1f2a3a]" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[10px]" style={{ background: backdrop }}>
              <div
                aria-hidden="true"
                className="flex shrink-0 items-center gap-5 px-5 text-[13px]"
                style={{ height: MAC.menuBar, background: chrome.menu, color: chrome.menuText, ...system }}
              >
                <span className="font-semibold">Safari</span>
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>History</span>
                <span className="ml-auto">Tue 9:41</span>
              </div>
              <div
                aria-hidden="true"
                className="flex shrink-0 items-center gap-4 px-4"
                style={{ height: MAC.toolbar, background: chrome.bar, borderBottom: `1px solid ${chrome.line}` }}
              >
                <span className="flex gap-[8px]">
                  <span className="size-[12px] rounded-full bg-[#ff5f57]" />
                  <span className="size-[12px] rounded-full bg-[#febc2e]" />
                  <span className="size-[12px] rounded-full bg-[#28c840]" />
                </span>
                <span
                  className="mx-auto flex h-[30px] w-[560px] items-center justify-center rounded-lg text-[14px]"
                  style={{ background: chrome.field, color: chrome.text, ...system }}
                >
                  yoursite.com
                </span>
                <span className="w-[52px]" />
              </div>
              {iframe}
            </div>
          </div>
        ) : (
          <div
            className="relative h-full overflow-hidden rounded-[64px] bg-[#1a1a1c] shadow-2xl ring-1 ring-black/40"
            style={{ padding: IPHONE.bezel }}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[52px]" style={{ background: backdrop }}>
              <StatusBar dark={dark} />
              {iframe}
              {/* Safari's address bar sits at the bottom on iPhone. */}
              <div aria-hidden="true" className="flex h-[76px] shrink-0 items-start justify-center pt-2" style={{ background: chrome.bar }}>
                <span
                  className="flex h-[44px] w-[360px] items-center justify-center rounded-[14px] text-[16px]"
                  style={{ background: chrome.field, color: chrome.text, ...system }}
                >
                  yoursite.com
                </span>
              </div>
            </div>
            <div aria-hidden="true" className="absolute left-1/2 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" style={{ top: IPHONE.bezel + 11 }} />
          </div>
        )}
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
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-between px-8 pt-1"
      style={{ height: IPHONE.statusBar, color: dark ? '#fff' : '#000' }}
    >
      <span className="w-[54px] text-center text-[17px] font-semibold" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
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
