import { RUNTIME_MIN } from './runtime.generated'

/** Minified profile-modal script for the badge whose class prefix is `c` (e.g. "sp-abc123"). */
export function badgeRuntime(c: string): string {
  return RUNTIME_MIN.replace(/__C__/g, c)
}
