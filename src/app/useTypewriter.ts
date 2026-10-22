import { useEffect, type RefObject } from 'react'

/** Typing rhythm, in ms. A text effect, not a motion timing. */
const TYPE_MS = 70
const ERASE_MS = 40
const HOLD_MS = 2200

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

/**
 * Cycles the first word of the badge's normal text ("Crafted by" →
 * "Shipped by" → "Built by"…) like someone retyping it: erase the word,
 * type the next, hold. The rest of the text (" by") stays put.
 * With reduced motion, the words simply swap.
 */
export function useTypewriter(host: RefObject<HTMLElement | null>, words: string[], suffix = ' by') {
  useEffect(() => {
    let cancelled = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const run = async () => {
      // The snippet is injected after mount: wait for the text node.
      let el: HTMLElement | null = null
      while (!cancelled && !(el = host.current?.querySelector<HTMLElement>('[class$="__n"]') ?? null)) await sleep(50)
      if (!el) return
      let i = 0
      while (!cancelled) {
        await sleep(HOLD_MS)
        if (cancelled) return
        const next = words[(i + 1) % words.length]
        if (reduced) {
          el.textContent = next + suffix
        } else {
          let word = words[i % words.length]
          while (word.length && !cancelled) {
            word = word.slice(0, -1)
            el.textContent = word + suffix
            await sleep(ERASE_MS)
          }
          for (let k = 1; k <= next.length && !cancelled; k++) {
            el.textContent = next.slice(0, k) + suffix
            await sleep(TYPE_MS)
          }
        }
        i++
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [host, words, suffix])
}
