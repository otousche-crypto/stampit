import { CSS_SPRINGS } from '@/badge/springs-css'

/** Fluid's fast spring, for the Web Animations API (ms + linear() easing). */
export const springCss = {
  fast: { ms: parseFloat(CSS_SPRINGS.fast.duration) * 1000, easing: CSS_SPRINGS.fast.easing },
}
