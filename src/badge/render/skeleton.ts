/**
 * A placeholder website ("skeleton") around the badge, so the preview shows
 * it at scale, in a footer, as it will live on a real page.
 */
export function skeletonPage({
  code,
  backdrop,
  dark,
  device,
}: {
  code: string
  backdrop: string
  dark: boolean
  device: 'desktop' | 'mobile'
}): string {
  const block = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'
  const strong = dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.12)'
  const line = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'
  const css = `
html,body{margin:0;height:100%;background:${backdrop};color-scheme:${dark ? 'dark' : 'light'}}
body{display:flex;flex-direction:column;font-family:-apple-system,system-ui,sans-serif}
.s{background:${block};border-radius:8px}.k{background:${strong};border-radius:8px}
.w{width:100%;max-width:1080px;margin:0 auto;padding:0 ${device === 'mobile' ? 20 : 40}px;box-sizing:border-box}
header{height:${device === 'mobile' ? 56 : 72}px;display:flex;align-items:center;border-bottom:1px solid ${line}}
header .w{display:flex;align-items:center;gap:24px}
main{flex:1;min-height:0;overflow:hidden}
footer{border-top:1px solid ${line};padding:${device === 'mobile' ? 20 : 24}px 0}
footer .w{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}`
  const header =
    device === 'mobile'
      ? `<header><div class="w" style="justify-content:space-between"><div class="k" style="width:96px;height:22px"></div><div class="s" style="width:28px;height:22px"></div></div></header>`
      : `<header><div class="w"><div class="k" style="width:120px;height:24px"></div><div style="flex:1"></div><div class="s" style="width:64px;height:14px"></div><div class="s" style="width:64px;height:14px"></div><div class="s" style="width:64px;height:14px"></div><div class="k" style="width:96px;height:34px;border-radius:17px"></div></div></header>`
  const main =
    device === 'mobile'
      ? `<main><div class="w" style="padding-top:32px;display:flex;flex-direction:column;gap:12px"><div class="k" style="width:85%;height:30px"></div><div class="k" style="width:60%;height:30px"></div><div class="s" style="width:100%;height:12px;margin-top:8px"></div><div class="s" style="width:92%;height:12px"></div><div class="s" style="width:70%;height:12px"></div><div class="k" style="width:140px;height:44px;border-radius:22px;margin-top:12px"></div><div class="s" style="width:100%;height:220px;margin-top:20px;border-radius:16px"></div></div></main>`
      : `<main><div class="w" style="padding-top:72px;display:flex;flex-direction:column;align-items:center;gap:16px"><div class="k" style="width:560px;height:44px"></div><div class="k" style="width:400px;height:44px"></div><div class="s" style="width:520px;height:14px;margin-top:12px"></div><div class="s" style="width:440px;height:14px"></div><div style="display:flex;gap:12px;margin-top:16px"><div class="k" style="width:140px;height:44px;border-radius:22px"></div><div class="s" style="width:140px;height:44px;border-radius:22px"></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;width:100%;margin-top:56px"><div class="s" style="height:220px;border-radius:16px"></div><div class="s" style="height:220px;border-radius:16px"></div><div class="s" style="height:220px;border-radius:16px"></div></div></div></main>`
  // The badge sits in the middle of the footer, where the zoom lands.
  const side = (w: number) => (device === 'mobile' ? '' : `<div class="s" style="width:${w}px;height:12px;flex:1;max-width:${w}px"></div>`)
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${header}${main}<footer><div class="w">${side(160)}<div style="flex:none;margin:0 auto">${code}</div>${side(160)}</div></footer></body></html>`
}
