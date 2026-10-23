import type { HighlighterCore, LanguageInput } from 'shiki/core'

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

export type Grammar = 'html' | 'tsx' | 'vue' | 'svelte' | 'astro' | 'dart'

/** The other grammars load the first time their language is picked. */
const GRAMMARS: Record<Exclude<Grammar, 'html'>, () => Promise<{ default: LanguageInput }>> = {
  tsx: () => import('@shikijs/langs/tsx'),
  vue: () => import('@shikijs/langs/vue'),
  svelte: () => import('@shikijs/langs/svelte'),
  astro: () => import('@shikijs/langs/astro'),
  dart: () => import('@shikijs/langs/dart'),
}

export async function highlightCode(code: string, grammar: Grammar = 'html'): Promise<string> {
  const hl = await load()
  if (grammar !== 'html' && !hl.getLoadedLanguages().includes(grammar)) {
    await hl.loadLanguage((await GRAMMARS[grammar]()).default)
  }
  return hl.codeToHtml(code, {
    lang: grammar,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  })
}

export const highlightHtml = (code: string) => highlightCode(code, 'html')
