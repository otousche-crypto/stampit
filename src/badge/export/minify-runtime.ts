import { minify } from 'terser'

export async function minifyRuntime(source: string): Promise<string> {
  const result = await minify(source, {
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false },
  })
  if (!result.code) throw new Error('terser produced no output')
  return result.code
}
