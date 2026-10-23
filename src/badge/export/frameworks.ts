import type { GeneratedBadge } from './generateHtml'

/** The Code tab's languages. HTML is the snippet itself; the others wrap the same markup, CSS and script. */
export const CODE_LANGUAGES = ['html', 'react', 'vue', 'svelte', 'astro'] as const
export type CodeLanguage = (typeof CODE_LANGUAGES)[number]

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  html: 'HTML',
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
  astro: 'Astro',
}

/** Shiki grammar per language. */
export const CODE_LANGUAGE_GRAMMAR: Record<CodeLanguage, 'html' | 'tsx' | 'vue' | 'svelte' | 'astro'> = {
  html: 'html',
  react: 'tsx',
  vue: 'vue',
  svelte: 'svelte',
  astro: 'astro',
}

/** Suggested file name, shown in the header comment. */
const FILE_NAMES: Record<CodeLanguage, string> = {
  html: 'footer.html',
  react: 'StampitBadge.tsx',
  vue: 'StampitBadge.vue',
  svelte: 'StampitBadge.svelte',
  astro: 'StampitBadge.astro',
}

export function codeFileName(language: CodeLanguage): string {
  return FILE_NAMES[language]
}

const indent = (text: string, spaces: number) =>
  text
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n')

/** Text inside a JS template literal. */
const templateSafe = (text: string) => text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

/** Svelte, Astro and JSX read `{` as an expression: braces in the user's text become entities. */
const bracesSafe = (markup: string) => markup.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')

/** The header comment's text, without the HTML comment markers. */
const headerText = (badge: GeneratedBadge) => badge.header.replace(/^<!--\s*/, '').replace(/\s*-->$/, '')

/** SVG presentation attributes are camelCase in JSX. */
const JSX_ATTRIBUTES: Record<string, string> = {
  class: 'className',
  popovertarget: 'popoverTarget',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'font-size': 'fontSize',
}

/** The generated markup as JSX: renamed attributes, style objects, self-closing void tags. */
export function toJsx(markup: string): string {
  return bracesSafe(markup)
    .replace(/\s([a-z][a-z-]*)=/g, (match, name: string) => (JSX_ATTRIBUTES[name] ? ` ${JSX_ATTRIBUTES[name]}=` : match))
    .replace(/style="([^"]*)"/g, (_, decl: string) => {
      const entries = decl
        .split(';')
        .filter(Boolean)
        .map((d) => {
          const [prop, ...rest] = d.split(':')
          return `'${prop.trim()}': '${rest.join(':').trim()}'`
        })
      return `style={{ ${entries.join(', ')} } as CSSProperties}`
    })
    .replace(/<(img|br|hr|input)([^>]*?)\s*\/?>/g, '<$1$2 />')
}

/** The same badge in another framework. HTML returns the snippet unchanged. */
export function toFramework(badge: GeneratedBadge, language: CodeLanguage): string {
  const { html, css, js } = badge
  const header = headerText(badge)
  switch (language) {
    case 'html':
      return badge.code

    case 'react': {
      const usesStyle = html.includes('style="')
      const imports = [js ? 'useEffect' : '', usesStyle ? 'type CSSProperties' : ''].filter(Boolean)
      const lines = [
        `// ${header}`,
        imports.length ? `import { ${imports.join(', ')} } from 'react'` : '',
        '',
        `const css = \`${templateSafe(css)}\``,
        '',
        'export function StampitBadge() {',
      ]
      if (js) lines.push('  useEffect(() => {', indent(js, 4), '  }, [])', '')
      lines.push('  return (', '    <>', '      <style>{css}</style>', indent(toJsx(html), 6), '    </>', '  )', '}')
      return lines.filter((l, i) => !(l === '' && i === 1)).join('\n') + '\n'
    }

    case 'vue': {
      const parts = [`<!-- ${header} -->`, '<template>', indent(html, 2), '</template>']
      if (js) parts.push('', '<script setup>', "import { onMounted } from 'vue'", '', 'onMounted(() => {', indent(js, 2), '})', '</script>')
      // Not scoped: the classes are already unique to this badge.
      parts.push('', '<style>', css, '</style>')
      return parts.join('\n') + '\n'
    }

    case 'svelte': {
      const script = [`  const css = \`${templateSafe(css)}\``]
      if (js) script.unshift("  import { onMount } from 'svelte'", '')
      if (js) script.push('', '  onMount(() => {', indent(js, 4), '  })')
      return (
        [
          `<!-- ${header} -->`,
          '<script>',
          ...script,
          '</script>',
          '',
          // In <svelte:head>, not <style>: Svelte would scope the selectors and drop the "unused" ones.
          '<svelte:head>',
          '  {@html `<style>${css}</style>`}',
          '</svelte:head>',
          '',
          bracesSafe(html),
        ].join('\n') + '\n'
      )
    }

    case 'astro': {
      const parts = [`<!-- ${header} -->`, bracesSafe(html), '', '<style is:global>', css, '</style>']
      if (js) parts.push('', '<script is:inline>', js, '</script>')
      return parts.join('\n') + '\n'
    }
  }
}
