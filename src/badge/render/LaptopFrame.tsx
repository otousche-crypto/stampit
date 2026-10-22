import type { ReactNode } from 'react'

/**
 * The top of a MacBook screen: dark bezel with the camera notch, then a
 * browser window (traffic lights, address bar) around the page. The frame
 * runs off the bottom of the stage, so only the top of the screen shows.
 */
export function LaptopFrame({ backdrop, dark, children }: { backdrop: string; dark: boolean; children: ReactNode }) {
  const chrome = dark
    ? { bar: '#2a2a2d', field: '#1c1c1e', text: 'rgba(255,255,255,.55)', line: 'rgba(255,255,255,.08)', menu: '#1b1b1d', menuText: 'rgba(255,255,255,.85)' }
    : { bar: '#ececef', field: '#ffffff', text: 'rgba(0,0,0,.5)', line: 'rgba(0,0,0,.08)', menu: '#f6f6f8', menuText: 'rgba(0,0,0,.85)' }
  return (
    <div className="relative mx-auto mt-6 flex h-[calc(100%-1.5rem)] w-full max-w-[980px] flex-col rounded-t-[22px] bg-[#0e0e10] px-[12px] pt-[12px] shadow-2xl ring-1 ring-black/40">
      {/* Camera notch */}
      <div aria-hidden="true" className="absolute left-1/2 top-0 h-[34px] w-[170px] -translate-x-1/2 rounded-b-[12px] bg-[#0e0e10]">
        <span className="absolute left-1/2 top-[14px] size-[6px] -translate-x-1/2 rounded-full bg-[#1f2a3a]" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[8px]" style={{ background: backdrop }}>
        {/* macOS menu bar: the notch sits in it, as on a real MacBook */}
        <div
          aria-hidden="true"
          className="flex h-[24px] shrink-0 items-center gap-4 px-4 text-[12px]"
          style={{ background: chrome.menu, color: chrome.menuText, fontFamily: '-apple-system, system-ui, sans-serif' }}
        >
          <span className="font-semibold">Safari</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span className="ml-auto">9:41</span>
        </div>
        {/* Browser toolbar */}
        <div
          aria-hidden="true"
          className="flex h-[38px] shrink-0 items-center gap-3 px-3"
          style={{ background: chrome.bar, borderBottom: `1px solid ${chrome.line}` }}
        >
          <span className="flex gap-[7px]">
            <span className="size-[11px] rounded-full bg-[#ff5f57]" />
            <span className="size-[11px] rounded-full bg-[#febc2e]" />
            <span className="size-[11px] rounded-full bg-[#28c840]" />
          </span>
          <span
            className="mx-auto flex h-[24px] w-full max-w-[360px] items-center justify-center rounded-md text-[12px]"
            style={{ background: chrome.field, color: chrome.text, fontFamily: '-apple-system, system-ui, sans-serif' }}
          >
            yoursite.com
          </span>
          <span className="w-[47px]" />
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center">{children}</div>
      </div>
    </div>
  )
}
