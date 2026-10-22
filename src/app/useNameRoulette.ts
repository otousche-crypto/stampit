import { useEffect, type RefObject } from 'react'
import { springCss } from './springCss'

/** Roulette rhythm, in ms. A text effect, not a motion timing. */
const HOLD_MS = 3200
/** Ticks of the spin: quick at first, slowing down before it lands. */
const SPIN_STEPS = [50, 50, 55, 60, 70, 80, 95, 115, 140, 175, 220]

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

/**
 * Spins the badge's bold name like a roulette: names flick past, slowing
 * down, and it lands on a new random one. The avatar initials follow.
 * With reduced motion, the name simply swaps.
 */
export function useNameRoulette(host: RefObject<HTMLElement | null>, names: string[], first: string) {
  useEffect(() => {
    let cancelled = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let current = first

    const show = (name: string, flick: boolean) => {
      const bold = host.current?.querySelector<HTMLElement>('[class$="__b"]')
      const avatar = host.current?.querySelector<HTMLElement>('[class$="__av"]')
      if (bold) {
        bold.textContent = name
        bold.style.display = 'inline-block' // so the flick can move it
        if (flick && !reduced) {
          bold.animate([{ transform: 'translateY(-40%)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], {
            duration: springCss.fast.ms,
            easing: springCss.fast.easing,
          })
        }
      }
      if (avatar && !avatar.querySelector('img')) avatar.textContent = initials(name)
    }
    const pick = (not: string) => {
      const pool = names.filter((n) => n !== not)
      return pool[Math.floor(Math.random() * pool.length)]
    }

    const run = async () => {
      while (!cancelled) {
        await sleep(HOLD_MS)
        if (cancelled) return
        if (!reduced) {
          let shown = current
          for (const step of SPIN_STEPS) {
            if (cancelled) return
            shown = pick(shown)
            show(shown, true)
            await sleep(step)
          }
        }
        current = pick(current)
        show(current, true)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [host, names, first])
}
