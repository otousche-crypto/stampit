import { useEffect } from 'react'

/**
 * Pins the site theme (Fluid tokens switch on `html.dark`) while mounted,
 * then hands it back to the system setting.
 */
export function usePinnedTheme(theme: 'light' | 'dark') {
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme-lock', '')
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(
    () => () => {
      const root = document.documentElement
      root.removeAttribute('data-theme-lock')
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
    },
    [],
  )
}
