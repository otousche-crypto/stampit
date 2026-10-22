import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { badgeRuntime } from './runtime'
import { minifyRuntime } from './minify-runtime'
import { RUNTIME_MIN } from './runtime.generated'

describe('badge runtime', () => {
  it('is valid, compact JavaScript', () => {
    const js = badgeRuntime('sp-test1234')
    expect(() => new Function(js)).not.toThrow()
    expect(js).not.toContain('__C__')
    expect(js).not.toContain('__S__')
    expect(js).toContain('sp-test1234__menu')
    expect(js.length).toBeLessThan(3500)
  })

  it('is in sync with its source (run `npm run build:runtime`)', async () => {
    const source = readFileSync(new URL('./runtime.source.js', import.meta.url), 'utf8')
    expect(await minifyRuntime(source)).toBe(RUNTIME_MIN)
  })
})
