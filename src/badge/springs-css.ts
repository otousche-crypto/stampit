/**
 * Fluid's three springs (`@/lib/springs`), sampled once from Motion's own
 * spring solver into CSS `linear()` curves, so the exported badge moves like
 * the site without shipping any animation library. Values are hard-coded on
 * purpose: this file and `lib/springs` are the only homes for timings.
 *
 * Regenerate: spring({ keyframes: [0, 1], duration, bounce }) sampled at
 * 21 evenly spaced points over its settle time (= its duration).
 */
export type CssSpring = { name: string; duration: string; easing: string }

export const CSS_SPRINGS = {
  /** 0.08 s, bounce 0 — hover, tooltips. */
  fast: {
    name: 'fast',
    duration: '.08s',
    easing:
      'linear(0,.08,.24,.409,.558,.678,.77,.838,.887,.922,.947,.964,.976,.984,.989,.993,.995,.997,.998,.999,1)',
  },
  /** 0.16 s, bounce 0 — the "+" icon, closing. */
  moderate: {
    name: 'moderate',
    duration: '.16s',
    easing:
      'linear(0,.08,.238,.406,.554,.674,.767,.835,.885,.921,.946,.963,.975,.983,.989,.993,.995,.997,.998,.999,1)',
  },
  /** 0.24 s, bounce 0.12 — bubbles opening. */
  slow: {
    name: 'slow',
    duration: '.24s',
    easing:
      'linear(0,.072,.224,.394,.551,.682,.784,.86,.913,.949,.973,.987,.996,1,1.002,1.003,1.003,1.003,1.002,1.002,1)',
  },
  /** `slow.exit` — a 0.16 s tween, one tier quicker than the entrance. */
  slowExit: {
    name: 'slow-exit',
    duration: '.16s',
    easing: 'cubic-bezier(.4,0,1,1)',
  },
  /**
   * Multi-step attention effects (shake, pulse): keyframes rather than a
   * spring, so one smooth curve and a length of two slow springs.
   */
  attention: {
    name: 'attention',
    duration: '.48s',
    easing: 'cubic-bezier(.4,0,.2,1)',
  },
} as const satisfies Record<string, CssSpring>

export type CssSpringName = keyof typeof CSS_SPRINGS

/** Stagger between bubbles on open, centre outwards (§8.4). */
export const BUBBLE_STAGGER_MS = 30

/** Hover delay before a bubble tooltip appears (§8.4). */
export const TOOLTIP_DELAY = '.3s'
