# Stampit

> Stamp everything you ship.

Make a "Made by" signature badge for your project footers, then copy a prompt for your AI coding agent or a standalone HTML/CSS snippet. Product spec: [docs/PRD.md](docs/PRD.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: generators (snapshots), contrast, URL storage, runtime
npm run build      # demo badge + type check + Vite build
```

| Script | What it does |
|---|---|
| `build:demo` | Regenerates the home page demo from `generateHtml()` (runs before every build) |
| `build:runtime` | Minifies the bubble menu script `src/badge/export/runtime.source.js` |
| `build:og` | Redraws `public/og.png` (1200×630) |
| `test:pages` | Writes manual QA pages to `test-pages/` (served by the dev server) |

## Where things live

- `src/badge/` — the badge: schema, presets, contrast, channels, CSS springs, generators (`export/generateHtml.ts`, `export/generatePrompt.ts`). Pure and framework-free.
- `src/editor/` — the `/create` editor (Fluid Functionalism components).
- `src/storage/` — URL hash and localStorage.
- `src/components/ui`, `src/lib`, `src/hooks` — installed from the `@fluid` registry. Compose, don't edit.

## Open points (PRD §16)

The domain is still a placeholder: `src/config/site.ts` and the meta tags in `index.html`.
