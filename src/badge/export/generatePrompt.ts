import { CHANNELS, channelLabel } from '../channels'
import type { BadgeConfig, Palette } from '../schema'
import { BUBBLE_STAGGER_MS, CSS_SPRINGS, TOOLTIP_DELAY } from '../springs-css'
import {
  FONT_STACKS,
  SIZES,
  SOFT_SHADOW,
  SOFT_SHADOW_HOVER,
  activeSocials,
  badgeText,
  deriveInitials,
  generateHtml,
  initialsColor,
  usesBubbles,
  type GenerateHtmlOptions,
} from './generateHtml'

const ICON_TEXT = {
  arrow: 'an "arrow-up-right" (Lucide path: line 7,17 → 17,7 and polyline 7,7 17,7 17,17)',
  triangle: 'a small filled triangle pointing right, rounded corners',
  link: 'a "link" chain (Lucide link icon)',
} as const

const ICON_HOVER_TEXT = {
  arrow: 'the arrow slides 2px up and 2px right',
  triangle: 'the triangle slides 2px right',
  link: 'the link icon tilts 15°',
} as const

/** Where the agent should put the uploaded photo. */
export const UPLOAD_PUBLIC_PATH = '/stampit-avatar.webp'

/** AI tools the prompt can be tuned for ("Optimized for" in the Prompt tab). */
export const PROMPT_AGENTS = ['claude-code', 'codex', 'cursor', 'replit', 'lovable', 'bolt', 'v0'] as const
export type PromptAgent = (typeof PROMPT_AGENTS)[number]

export const PROMPT_AGENT_LABELS: Record<PromptAgent, string> = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
  cursor: 'Cursor',
  replit: 'Replit',
  lovable: 'Lovable',
  bolt: 'Bolt.new',
  v0: 'v0 by Vercel',
}

/**
 * How each tool works, in a few lines: coding agents read and edit the user's
 * repository; app builders edit a hosted app, often React + Tailwind, and take
 * files as chat attachments.
 */
const AGENT_NOTES: Record<PromptAgent, string[]> = {
  'claude-code': [
    "You are running in the user's repository. Search it for the footer component (or the root layout if there is none), add the badge there, then run the project's typecheck, lint and tests and fix anything you broke.",
  ],
  codex: [
    "You are working in the user's repository. Find the footer component (or the root layout), make the change as a small, focused diff, then run the project's checks (typecheck, lint, tests) before you finish.",
  ],
  cursor: [
    "Use the codebase context to find the footer component (or the root layout) and edit it in place. Keep the change to the files that need it, and follow the project's rules files (.cursor/rules) if any.",
  ],
  replit: [
    "Edit this Repl's footer (create a simple footer if the app has none). Use the language and framework already in the Repl, add no package, and restart the app to check the badge renders.",
  ],
  lovable: [
    'This is a Lovable app (React, Vite, Tailwind, shadcn/ui). Add the badge as its own component (for example src/components/StampitBadge.tsx) and render it in the footer; create a simple footer if there is none. Keep the CSS in the component exactly as given: the class names are already unique.',
  ],
  bolt: [
    "This is a Bolt.new project. Detect its framework from package.json, add the badge as a component in that framework and render it in the footer (create one if needed). Add no dependency and keep the preview running.",
  ],
  v0: [
    'This is a v0 project (Next.js App Router, Tailwind, shadcn/ui). Add the badge as a client component (it needs "use client" if it runs a script) and render it in the footer of app/layout.tsx, or in a footer component if one exists.',
  ],
}

/** App builders take the photo as a chat attachment rather than a file in the repo. */
const BUILDERS: ReadonlySet<PromptAgent> = new Set(['replit', 'lovable', 'bolt', 'v0'])

export type GeneratePromptOptions = Pick<GenerateHtmlOptions, 'editUrl' | 'avatarFailed'> & {
  /** Tune the brief for one tool. Omitted, it stays tool-neutral. */
  agent?: PromptAgent
}

function paletteLines(p: Palette): string[] {
  return [
    `  - Background: ${p.background}`,
    `  - Border: ${p.border}`,
    `  - Normal text: ${p.textNormal}`,
    `  - Bold text: ${p.textBold}`,
    `  - Icon: ${p.icon}`,
    `  - Backdrop blur: ${p.blur ? `${p.blur}px (backdrop-filter, with -webkit- prefix)` : 'none'}`,
  ]
}

const seconds = (s: string) => s.replace(/^\./, '0.')

/** One line per badge model; the reference implementation has the exact CSS. */
const LAYOUT_SPEC: Record<BadgeConfig['layout'], string> = {
  pill: 'Pill. [avatar] · normal text · bold text · icon, in one row, vertically centered, no wrapping.',
  stamp: 'Stamp. A circle with the avatar in its center and the full text, upper-case, running around the edge (SVG textPath with textLength = the circumference). The text ring turns slowly (one turn per 24s, linear); no rotation with reduced motion.',
  split: 'Label, in two parts like a shields.io badge: avatar and normal text on the badge surface, then the bold text and icon on an inverted segment (bold text color as background, surface color as text).',
  card: 'Card. A small card: avatar 44px on the left; normal text (12px), bold text (16px) and the role (13px, normal text color) stacked on the right; the icon in the top-right corner; the social links always visible in a row underneath. The whole card is the link (a stretched ::before), the social links sit above it.',
  team: 'Team. Overlapping round avatars (yours on top, then up to two teammates as initials on colored circles, each ringed with the surface color), then the normal text and the names: "Olivier, Camille & Lucas", or "… & N others" beyond three.',
}

/** Pure: config → plain-text brief for an AI coding agent (§11.2). */
export function generatePrompt(config: BadgeConfig, options: GeneratePromptOptions = {}): string {
  const size = SIZES[config.text.size]
  const { palettes, adaptToSite, base } = config.theme
  const radiusPx = Math.round(((config.shape.radius * size.height) / 2) * 100) / 100
  const bubbles = usesBubbles(config)
  const upload = config.avatar.source === 'upload'
  const text = badgeText(config)
  const hasAvatar = config.avatar.source !== 'none'
  const padLeft = hasAvatar ? size.padLeft : size.padRight

  const reference = generateHtml(config, {
    editUrl: options.editUrl,
    avatarFailed: options.avatarFailed,
    // The base64 photo never goes in the prompt: the agent uses the file instead.
    uploadPath: upload ? UPLOAD_PUBLIC_PATH : undefined,
  })

  const out: string[] = []
  const section = (title: string) => out.push('', `## ${title}`, '')

  out.push('# Add a "Made by" signature badge to this project')

  section('Goal')
  out.push(
    `Add this signature badge to the footer of the current project, using the project's own stack and conventions (components, styling approach, file structure). The badge reads "${text}".`,
    'Match the visual spec and behavior below exactly. The reference implementation at the end is the source of truth: adapt it to the project rather than pasting it as-is when a native approach fits better. Add no new dependency.',
  )
  if (options.agent) {
    section(`Working in ${PROMPT_AGENT_LABELS[options.agent]}`)
    out.push(...AGENT_NOTES[options.agent])
  }

  section('Visual spec')
  out.push(
    `- Layout: ${LAYOUT_SPEC[config.layout]}`,
    `- Order: ${config.text.order === 'normal-first' ? 'normal text, then bold text' : 'bold text, then normal text'}. One regular space between them.`,
    `- Normal text: "${config.text.normal.trim() || '(none)'}", weight 400.`,
    `- Bold text: "${config.text.bold.trim() || '(none)'}", weight ${config.text.boldWeight}.`,
    `- Font: system stack only, no web font: ${FONT_STACKS[config.text.font]}.`,
    `- Size ${config.text.size.toUpperCase()}: height ${size.height}px, font size ${size.text}px, padding 0 ${size.padRight}px 0 ${padLeft}px, gap ${size.gap}px.`,
    `- Corner radius: ${radiusPx}px${config.shape.radius === 1 ? ' (a full capsule)' : ''}.`,
    config.shape.borderWidth
      ? `- Border: ${config.shape.borderWidth}px, drawn as an inner ring (box-shadow: inset 0 0 0 ${config.shape.borderWidth}px <border color>) so it never changes the size.`
      : '- Border: none.',
    config.shape.shadow === 'soft'
      ? `- Shadow: ${SOFT_SHADOW}; on hover ${SOFT_SHADOW_HOVER}.`
      : '- Shadow: none.',
  )
  if (config.shape.showIcon) {
    out.push(
      bubbles
        ? `- Icon: a "+" (two 2px strokes, round caps), ${size.icon}px, in the icon color. It rotates 45° into "×" while the menu is open.`
        : `- Icon: ${ICON_TEXT[config.shape.iconStyle]}, ${size.icon}px, 2px stroke, currentColor, in the icon color, aria-hidden (exact SVG in the reference).`,
    )
  } else {
    out.push('- Icon: none.')
  }

  if (!hasAvatar) {
    out.push('- Avatar: none. Left and right padding are equal.')
  } else if (config.avatar.source === 'initials' || options.avatarFailed) {
    out.push(
      `- Avatar: round, ${size.avatar}px, background ${config.avatar.background}, initials "${deriveInitials(config)}" in ${initialsColor(config, adaptToSite ? palettes.light : palettes[base])}, weight 600, ${Math.round(size.avatar * 0.4)}px.`,
    )
  } else if (upload) {
    out.push(
      `- Avatar: round, ${size.avatar}px, the photo at ${UPLOAD_PUBLIC_PATH} (see "Avatar" below), object-fit: cover, background ${config.avatar.background} behind transparent pixels.`,
    )
  } else {
    out.push(
      `- Avatar: round, ${size.avatar}px, image ${config.avatar.url}, object-fit: cover, background ${config.avatar.background} behind transparent pixels. Decorative: alt="".`,
    )
  }

  if (adaptToSite) {
    out.push('- Colors follow the site theme through prefers-color-scheme.', '- Light palette:', ...paletteLines(palettes.light), '- Dark palette:', ...paletteLines(palettes.dark))
  } else {
    out.push('- Colors:', ...paletteLines(palettes[base]))
  }
  out.push(
    '- Scope every class with a unique prefix and reset box-sizing, margin, padding, font, line-height and list-style on the badge and its children, so the host page CSS cannot leak in.',
  )

  section('Behavior')
  const springs = [
    `fast = ${seconds(CSS_SPRINGS.fast.duration)}, no bounce`,
    `moderate = ${seconds(CSS_SPRINGS.moderate.duration)}, no bounce`,
    `slow = ${seconds(CSS_SPRINGS.slow.duration)}, bounce 0.12`,
    `slow exit = ${seconds(CSS_SPRINGS.slowExit.duration)} tween`,
  ]
  out.push(
    `- Motion uses springs, expressed in CSS as linear() easings (values in the reference): ${springs.join('; ')}. Never hard-code other durations.`,
  )
  if (!bubbles) {
    const url = config.click.link.url
    const mail = url.startsWith('mailto:')
    out.push(
      `- Mode: Link. The whole badge is one <a href="${url || '(missing)'}">${config.click.link.newTab && !mail ? ' opening in a new tab (target="_blank" rel="noopener noreferrer")' : ''}.`,
    )
    if (config.shape.showIcon) out.push(`- Hover and keyboard focus: ${ICON_HOVER_TEXT[config.shape.iconStyle]} (fast spring).`)
    if (config.shape.shadow === 'soft') out.push('- Hover: the shadow grows as specified (fast spring).')
  } else {
    const { channels, labels } = config.click.bubbles
    out.push(
      '- Mode: Bubbles. Clicking the badge toggles a small menu of links ("bubbles"). Hovering does not open it.',
      '- Links, in this order:',
      ...channels.map((ch, i) => `  ${i + 1}. ${channelLabel(ch)}: ${ch.url}`),
      `- Links open ${config.click.link.newTab ? 'in a new tab, except email links (mailto:, never target="_blank")' : 'in the same tab'}.`,
      `- Bubbles: circles of ${size.bubble}px${labels === 'icon-label' ? ' that become capsules with icon + label (label in the bold text color)' : ''}; same background, border and shadow as the badge; corner radius scaled like the badge; inline SVG icon 18px in the icon color. Touch target at least 44 × 44px.`,
      labels === 'icon'
        ? `- Icon only: a tooltip with the channel name appears after ${seconds(TOOLTIP_DELAY)} of hover and at once on keyboard focus. On touch screens (hover: none), show the names under the bubbles at 11px instead.`
        : '- Labels are always visible.',
      '- Placement: one row centered on the badge, 12px above it, 8px between bubbles, in a gentle arc (the middle sits 8px higher than the ends).',
      '- If there is less room above than the menu height + 16px, open below with the arc inverted.',
      '- Keep the row at least 8px from the viewport edges. If it is wider than the viewport minus 16px, use 2 rows, the longer one nearest the badge.',
      '- Reposition on scroll and resize (requestAnimationFrame); close if the badge leaves the viewport.',
      `- Opening: each bubble travels from the badge center to its place, scale 0.6 → 1, opacity 0 → 1 (slow spring), staggered ${BUBBLE_STAGGER_MS}ms from the center outwards. Closing: all together, back into the badge with a fade (slow exit). Bubble hover: scale 1.08 (fast).`,
      '- Use the native popover API (<ul popover="auto"> + popovertarget on the button) so the menu renders in the top layer: never clipped by overflow: hidden or a transform. Fall back to a class toggle + outside click + Escape where popover is unsupported. Without JS the popover opens centered and stays usable.',
      '- Hide the menu when printing.',
    )
  }
  const socials = activeSocials(config)
  if (socials.length) {
    out.push(
      `- Social links: ${socials.length} round icon link${socials.length > 1 ? 's' : ''} right of the badge, 6px apart, in this order:`,
      ...socials.map(({ network, url }, i) => `  ${i + 1}. ${CHANNELS[network].label}: ${url}`),
      `  Each is a ${SIZES[config.text.size].height}px square with the badge's background, border, shadow and corner radius, the network logo in the icon color. They sit outside the layout (absolutely positioned right of the badge) and stay hidden until the badge is hovered or focused: then they slide in from 6px left and scale 0.8 → 1 with a fade (slow spring), ${BUBBLE_STAGGER_MS}ms apart, left to right, and leave together (slow exit). Always visible on touch screens (hover: none). Hovering one scales it to 1.06 (fast spring). Accessible name "{Network}${config.click.link.newTab ? ', opens in a new tab' : ''}".`,
    )
  }
  const { entrance, repeat, hover } = config.motion
  const ENTRANCE_TEXT = {
    shake: 'gives a short horizontal shake (±3px)',
    bump: 'gives a small bump: scale 1 → 1.08 → 0.97 → 1',
    shine: 'shows a sheen sweeping once from left to right across it (a gradient band on a clipped ::after, 0.2s after load: white on dark surfaces, a faint dark band on light ones)',
  } as const
  const HOVER_TEXT = {
    grow: 'scales to 1.04 (fast spring)',
    lift: 'rises 2px (fast spring)',
    pulse: 'pulses to 1.05 and back, looping while hovered',
    shake: 'gives a short horizontal shake (±2px), once per hover',
  } as const
  if (entrance !== 'none') {
    out.push(`- On appear: the badge ${ENTRANCE_TEXT[entrance]}. Animate a wrapper, not the clickable element, so the hover effect never restarts it.`)
  }
  if (repeat !== 'none') {
    out.push(
      `- On delay: every ${seconds(CSS_SPRINGS.repeat.duration)}, starting ${seconds(CSS_SPRINGS.repeat.duration)} after load, the badge ${ENTRANCE_TEXT[repeat].replace(', 0.2s after load:', ':')}. Loop it with CSS (one keyframe cycle per period), no timers.`,
    )
  }
  if (hover !== 'none') {
    out.push(`- On hover: the badge ${HOVER_TEXT[hover]}${hover === 'pulse' || hover === 'shake' ? `, over ${seconds(CSS_SPRINGS.attention.duration)}` : ''}.`)
  }
  out.push(
    '- prefers-reduced-motion: reduce → no movement, rotation or scaling; state changes are instant or fade only.',
  )

  section('Accessibility')
  if (bubbles) {
    out.push(
      `- Disclosure pattern, not role="menu": the badge is a <button> named "${text ? `${text}, show links` : 'Show links'}" with aria-expanded and aria-controls; the bubbles are a <ul> of <a>.`,
      '- Each bubble is named "{Channel}, opens in a new tab" (email: "Email {bold text}").',
      '- Keyboard: Tab reaches the badge; Enter/Space opens and focuses the first bubble; arrow keys move between bubbles and wrap; Home/End jump to the first/last; Enter follows the link; Escape closes and returns focus to the badge; Tab from a bubble closes the menu and continues the tab order.',
      '- Touch: tap to open, tap a bubble to navigate, tap outside to close.',
    )
  } else {
    out.push(
      `- The link's accessible name is "${text}${config.click.link.newTab && !config.click.link.url.startsWith('mailto:') ? ', opens in a new tab' : ''}".`,
    )
  }
  out.push(
    '- Visible focus: a 2px outline in the bold text color, offset 2px, on :focus-visible.',
    '- The avatar and icons are decorative (alt="" / aria-hidden).',
    '- Touch targets of at least 44 × 44px.',
  )

  if (upload) {
    section('Avatar')
    out.push(
      options.agent && BUILDERS.has(options.agent)
        ? `The avatar is a photo the user downloaded from Stampit as "stampit-avatar.webp". Ask them to attach it to this chat if they haven't, save it as public${UPLOAD_PUBLIC_PATH} (or the app's static assets folder) and reference it as ${UPLOAD_PUBLIC_PATH}. The reference below already points there.`
        : `The avatar is a photo the user downloaded from Stampit as "stampit-avatar.webp". Ask for it if it isn't in the project yet, place it at public${UPLOAD_PUBLIC_PATH} (or the project's static assets folder) and reference it as ${UPLOAD_PUBLIC_PATH}. The reference below already points there.`,
    )
  }

  section('Reference implementation')
  out.push('Standalone HTML/CSS' + (bubbles ? '/JS' : '') + ', tested in Chrome, Safari and Firefox:', '', '```html', reference.trimEnd(), '```')

  section('Acceptance criteria')
  out.push(
    `1. Rendering: the footer shows the badge at ${size.height}px high with the exact colors, radius, border and shadow above, in ${adaptToSite ? 'both light and dark site themes' : 'the page'}.`,
    `2. Hover: ${bubbles ? 'the "+" nudges and the shadow grows; the menu does not open on hover' : 'the arrow slides 2px up-right and the shadow grows'}, with no layout shift.`,
    bubbles
      ? '3. Open/close: a click opens the bubbles above the badge (below near the top of the screen), inside the viewport; outside click, Escape and a second click close them.'
      : `3. Click: the badge opens ${config.click.link.url || 'its link'}${config.click.link.newTab ? ' in a new tab' : ''}.`,
    bubbles
      ? '4. Keyboard: Tab, Enter/Space, arrows, Home/End and Escape work as specified, focus returns to the badge, and the focus ring is visible.'
      : '4. Keyboard: Tab reaches the badge, the focus ring is visible, Enter follows the link.',
    '5. Reduced motion: with prefers-reduced-motion enabled, nothing moves; changes are instant or fades.',
  )
  return out.join('\n') + '\n'
}
