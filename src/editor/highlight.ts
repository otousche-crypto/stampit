import type { HighlighterCore } from 'shiki/core'

let highlighter: Promise<HighlighterCore> | null = null

/** Shiki, loaded on demand: core + JS regex engine + the HTML grammar + two themes. */
function load(): Promise<HighlighterCore> {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('@shikijs/langs/html'),
    import('@shikijs/themes/github-light'),
    import('@shikijs/themes/github-dark'),
  ]).then(([core, engine, html, light, dark]) =>
    core.createHighlighterCore({
      engine: engine.createJavaScriptRegexEngine(),
      langs: [html.default],
      themes: [light.default, dark.default],
    }),
  )
  return highlighter
}

export async function highlightHtml(code: string): Promise<string> {
  const hl = await load()
  return hl.codeToHtml(code, {
    lang: 'html',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  })
}
