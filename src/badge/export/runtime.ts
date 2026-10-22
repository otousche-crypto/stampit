import { BUBBLE_STAGGER_MS } from '../springs-css'
import { RUNTIME_MIN } from './runtime.generated'

/** Minified bubble-menu script for the badge whose class prefix is `c` (e.g. "sp-abc123"). */
export function badgeRuntime(c: string): string {
  return RUNTIME_MIN.replace(/__C__/g, c).replace(/__S__/g, String(BUBBLE_STAGGER_MS))
}
