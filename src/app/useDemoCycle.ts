import { useEffect, type RefObject } from 'react'
import { springCss } from './springCss'

/** Rhythm of the home demo, in ms. A text effect, not a motion timing. */
const HOLD_MS = 1800
const TYPE_MS = 70
const ERASE_MS = 40
/** Ticks of the name roulette: quick at first, slowing down before it lands. */
const SPIN_STEPS = [50, 50, 55, 60, 70, 80, 95, 115, 140, 175, 220]

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

/**
 * The home demo badge, alternating two effects:
 * 1. the verb is retyped ("Crafted by" → "Shipped by" → "Built by"…),
 * 2. then the name spins like a roulette and lands on a new random one
 *    (initials replace the photo). It starts on `first`, never comes back.
 * The name slot is sized once to the widest name, so the badge never
 * changes width when the name does. Elements are looked up at every step:
 * the snippet can be re-injected (Light / Dark) at any time.
 * With reduced motion, words and names simply swap.
 */
export function useDemoCycle(
  host: RefObject<HTMLElement | null>,
  verbs: string[],
  first: string,
  names: string[],
  suffix = ' by',
) {
  useEffect(() => {
    let cancelled = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const find = (sel: string) => host.current?.querySelector<HTMLElement>(sel) ?? null

    /** Fix the name slot to the widest name (measured in one go, before any paint). */
    const sizeNameSlot = (bold: HTMLElement) => {
      if (bold.dataset.sized) return
      const keep = bold.textContent
      bold.style.display = 'inline-block'
      let widest = 0
      for (const n of [first, ...names]) {
        bold.textContent = n
        widest = Math.max(widest, bold.getBoundingClientRect().width / zoomOf(bold))
      }
      bold.textContent = keep
      bold.style.width = `${Math.ceil(widest)}px`
      bold.dataset.sized = '1'
    }

    const writeVerb = (text: string) => {
      const el = find('[class$="__n"]')
      if (el) el.textContent = text
    }
    const showName = (name: string, flick: boolean) => {
      const bold = find('[class$="__b"]')
      const avatar = find('[class$="__av"]')
      if (bold) {
        sizeNameSlot(bold)
        bold.textContent = name
        if (flick && !reduced) {
          bold.animate([{ transform: 'translateY(-40%)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], {
            duration: springCss.fast.ms,
            easing: springCss.fast.easing,
          })
        }
      }
      if (avatar && name !== first) {
        // The photo belongs to the first name only: others get initials,
        // styled like the generator's initials avatar.
        avatar.textContent = initialsOf(name)
        Object.assign(avatar.style, { color: '#000', fontSize: '11px', fontWeight: '600', lineHeight: '1' })
      }
    }
    const pick = (not: string) => {
      const pool = names.filter((n) => n !== not && n !== first)
      return pool[Math.floor(Math.random() * pool.length)]
    }

    const run = async () => {
      let v = 0
      let name = first
      // Size the slot as soon as the snippet is there.
      while (!cancelled && !find('[class$="__b"]')) await sleep(50)
      if (cancelled) return
      showName(name, false)
      while (!cancelled) {
        // 1. Retype the verb.
        await sleep(HOLD_MS)
        if (cancelled) return
        const next = verbs[(v + 1) % verbs.length]
        if (reduced) writeVerb(next + suffix)
        else {
          let word = verbs[v % verbs.length]
          while (word.length && !cancelled) {
            word = word.slice(0, -1)
            writeVerb(word + suffix)
            await sleep(ERASE_MS)
          }
          for (let k = 1; k <= next.length && !cancelled; k++) {
            writeVerb(next.slice(0, k) + suffix)
            await sleep(TYPE_MS)
          }
        }
        v++
        // 2. Spin the name.
        await sleep(HOLD_MS)
        if (cancelled) return
        if (!reduced) {
          let shown = name
          for (const step of SPIN_STEPS) {
            if (cancelled) return
            shown = pick(shown)
            showName(shown, true)
            await sleep(step)
          }
        }
        name = pick(name)
        showName(name, true)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [host, verbs, first, names, suffix])
}

/** The preview scales the badge with CSS zoom: measure in the badge's own px. */
function zoomOf(el: HTMLElement): number {
  return (el as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom ?? 1
}
