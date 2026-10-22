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
 * The element is looked up at every step: the snippet may be re-injected
 * (Light / Dark switch) at any time.
 */
export function useTypewriter(host: RefObject<HTMLElement | null>, words: string[], suffix = ' by') {
  useEffect(() => {
    let cancelled = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const write = (text: string) => {
      const el = host.current?.querySelector<HTMLElement>('[class$="__n"]')
      if (el) el.textContent = text
    }

    const run = async () => {
      let i = 0
      while (!cancelled) {
        await sleep(HOLD_MS)
        if (cancelled) return
        const next = words[(i + 1) % words.length]
        if (reduced) {
          write(next + suffix)
        } else {
          let word = words[i % words.length]
          while (word.length && !cancelled) {
            word = word.slice(0, -1)
            write(word + suffix)
            await sleep(ERASE_MS)
          }
          for (let k = 1; k <= next.length && !cancelled; k++) {
            write(next.slice(0, k) + suffix)
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
