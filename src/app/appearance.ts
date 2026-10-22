import { useSyncExternalStore } from 'react'

/**
 * Light / Dark for the whole site, home and editor alike: one sticky switch
 * drives the Fluid tokens (`html.dark`) and the editor's preview backdrop.
 * Starts from the system setting; the visitor's choice is remembered.
 */
export type Appearance = 'light' | 'dark'

const KEY = 'stampit:appearance'
const listeners = new Set<() => void>()

function initial(): Appearance {
  try {
    const stored = window.localStorage.getItem(KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* no storage */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let current: Appearance = typeof window === 'undefined' ? 'light' : initial()

function apply() {
  document.documentElement.classList.toggle('dark', current === 'dark')
}
if (typeof window !== 'undefined') apply()

export function setAppearance(next: Appearance) {
  if (next === current) return
  current = next
  apply()
  try {
    window.localStorage.setItem(KEY, next)
  } catch {
    /* no storage */
  }
  listeners.forEach((l) => l())
}

export function useAppearance(): Appearance {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
    () => 'light',
  )
}
