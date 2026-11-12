import { CHANNELS, isValidUrl } from '../channels'
import type { BadgeConfig, Palette } from '../schema'
import { SOCIAL_STAGGER_MS, CSS_SPRINGS } from '../springs-css'
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
  resolveAvatar,
  githubUser,
  profileProjects,
  usesProfile,
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
    "You are running in the user's repository. Find where the badge goes (the place the user asked for, otherwise the footer component or the root layout), add it there, then run the project's typecheck, lint and tests and fix anything you broke.",
  ],
  codex: [
    "You are working in the user's repository. Find where the badge goes (the place the user asked for, otherwise the footer component or the root layout), make the change as a small, focused diff, then run the project's checks (typecheck, lint, tests) before you finish.",
  ],
  cursor: [
    "Use the codebase context to find where the badge goes (the place the user asked for, otherwise the footer component or the root layout) and edit it in place. Keep the change to the files that need it, and follow the project's rules files (.cursor/rules) if any.",
  ],
  replit: [
    "Add the badge where the user asked, otherwise in this Repl's footer (create a simple footer if the app has none). Use the language and framework already in the Repl, add no package, and restart the app to check the badge renders.",
  ],
  lovable: [
    'This is a Lovable app (React, Vite, Tailwind, shadcn/ui). Add the badge as its own component (for example src/components/StampitBadge.tsx) and render it where the user asked, otherwise in the footer (create a simple footer if there is none). Keep the CSS in the component exactly as given: the class names are already unique.',
  ],
  bolt: [
    "This is a Bolt.new project. Detect its framework from package.json, add the badge as a component in that framework and render it where the user asked, otherwise in the footer (create one if needed). Add no dependency and keep the preview running.",
  ],
  v0: [
    'This is a v0 project (Next.js App Router, Tailwind, shadcn/ui). Add the badge as a client component (it needs "use client" if it runs a script) and render it where the user asked, otherwise in the footer of app/layout.tsx or in a footer component if one exists.',
  ],
}

export type GeneratePromptOptions = Pick<GenerateHtmlOptions, 'editUrl' | 'avatarFailed' | 'assetOrigin'> & {
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

/** Behavior lines for Profile mode: what the modal holds and how it moves. */
function profileSpec(config: BadgeConfig): string[] {
  const newTab = config.click.link.newTab
  const portfolio = config.click.link.url.trim()
  const socials = activeSocials(config)
  const user = githubUser(config)
  const projects = profileProjects(config)
  const lines = [
    '- Mode: Profile. The badge is a button; clicking it opens a modal profile card. Hovering does nothing more than the hover effect.',
    "- Modal: a native <dialog>, 400px wide (at most the viewport minus 32px), centered, 24px padding, scrolls inside when taller than the viewport. Same background, bold/normal text colors, border ring and font as the badge, corner radius 12 + 12 × the badge's roundness (px), shadow 0 24px 64px rgba(0,0,0,.24). Backdrop rgba(0,0,0,.4). The page does not scroll behind it.",
    '- Opening: fade in and rise from translateY(8px) scale(.97) (slow spring, @starting-style); closing: the reverse (slow exit). Reduced motion: fade only.',
    '- Close: a 32px round "×" button in the top-right corner (a <form method="dialog"> so it works without JS), Escape, or a click on the backdrop.',
    `- Head: a 56px avatar (initials when there is no photo), then the name "${config.text.bold.trim() || config.text.normal.trim()}" (18px, as an <h2>)${config.text.role.trim() ? ` and the role "${config.text.role.trim()}" under it in the normal text color` : ''}.`,
  ]
  const bio = config.click.profile.bio.trim()
  if (bio) lines.push(`- Bio under the head, in the normal text color: "${bio}".`)
  if (isValidUrl(portfolio) || socials.length) {
    lines.push(`- Links row (wraps), links open ${newTab ? 'in a new tab' : 'in the same tab'}:`)
    if (isValidUrl(portfolio)) lines.push(`  - "Portfolio" ${portfolio}: a 36px capsule filled with the bold text color, its text black or white (whichever reads), with a small up-right arrow.`)
    for (const { network, url } of socials) lines.push(`  - ${CHANNELS[network].label} ${url}: a 36px round icon button, a faint tint of the bold text color with a 1px border ring, the logo in the icon color.`)
  }
  if (user) {
    lines.push(
      `- "GitHub activity" section for @${user}: fetch https://api.github.com/users/${user}/events/public?per_page=100 (up to 3 pages, only while the 12-week window is not covered) the first time the modal opens, cache it in sessionStorage for 30 minutes. Draw one 10px cell per day for the last 12 weeks plus the current one (Sunday-first columns, 3px gaps), tinted with the bold text color by daily count (0, 1, 2–3, 4–6, 7+). Beside it: the total, "public events, last 12 weeks", "Last active Nd ago", and a link to the GitHub profile. A pulsing placeholder while loading; on error, "Activity unavailable right now." with the profile link.`,
    )
  }
  if (projects.length) {
    lines.push('- "Projects" section, a list of cards (faint tint of the bold text color, 1px border ring), each with the name and a short description in the normal text color, the whole card a link with an up-right arrow:')
    projects.forEach((p, i) => lines.push(`  ${i + 1}. ${p.name}${p.url ? ` — ${p.url}` : ''}${p.description ? ` — "${p.description}"` : ''}`))
  }
  lines.push('- Section titles: 12px, upper-case, letter-spacing .04em, normal text color.')
  return lines
}

/** Pure: config → plain-text brief for an AI coding agent (§11.2). */
export function generatePrompt(config: BadgeConfig, options: GeneratePromptOptions = {}): string {
  const size = SIZES[config.text.size]
  const { palettes, adaptToSite, base } = config.theme
  const radiusPx = Math.round(((config.shape.radius * size.height) / 2) * 100) / 100
  const profile = usesProfile(config)
  const text = badgeText(config)
  const avatar = resolveAvatar(config, options)
  const hasAvatar = config.avatar.source !== 'none'
  const padLeft = hasAvatar ? size.padLeft : size.padRight

  const reference = generateHtml(config, {
    editUrl: options.editUrl,
    avatarFailed: options.avatarFailed,
    assetOrigin: options.assetOrigin,
  })

  const out: string[] = []
  const section = (title: string) => out.push('', `## ${title}`, '')

  out.push('# Add a "Made by" signature badge to this project')

  section('Goal')
  out.push(
    `Add this signature badge to the current project where the user wants it (in the footer if they haven't said where), using the project's own stack and conventions (components, styling approach, file structure). The badge reads "${text}".`,
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
      `- Icon: ${ICON_TEXT[config.shape.iconStyle]}, ${size.icon}px, 2px stroke, currentColor, in the icon color, aria-hidden (exact SVG in the reference).`,
    )
  } else {
    out.push('- Icon: none.')
  }

  if (!hasAvatar) {
    out.push('- Avatar: none. Left and right padding are equal.')
  } else if (avatar.kind !== 'image') {
    out.push(
      `- Avatar: round, ${size.avatar}px, background ${config.avatar.background}, initials "${deriveInitials(config)}" in ${initialsColor(config, adaptToSite ? palettes.light : palettes[base])}, weight 600, ${Math.round(size.avatar * 0.4)}px.`,
    )
  } else {
    out.push(
      `- Avatar: round, ${size.avatar}px, image ${avatar.src}, object-fit: cover, background ${config.avatar.background} behind transparent pixels. Decorative: alt="".`,
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
  if (!profile) {
    const url = config.click.link.url
    const mail = url.startsWith('mailto:')
    out.push(
      `- Mode: Link. The whole badge is one <a href="${url || '(missing)'}">${config.click.link.newTab && !mail ? ' opening in a new tab (target="_blank" rel="noopener noreferrer")' : ''}.`,
    )
  } else {
    out.push(...profileSpec(config))
  }
  if (config.shape.showIcon) out.push(`- Hover and keyboard focus: ${ICON_HOVER_TEXT[config.shape.iconStyle]} (fast spring).`)
  if (config.shape.shadow === 'soft') out.push('- Hover: the shadow grows as specified (fast spring).')
  const socials = activeSocials(config)
  if (socials.length && !profile) {
    out.push(
      `- Social links: ${socials.length} round icon link${socials.length > 1 ? 's' : ''} right of the badge, 6px apart, in this order:`,
      ...socials.map(({ network, url }, i) => `  ${i + 1}. ${CHANNELS[network].label}: ${url}`),
      `  Each is a ${SIZES[config.text.size].height}px square with the badge's background, border, shadow and corner radius, the network logo in the icon color. They sit outside the layout (absolutely positioned right of the badge) and stay hidden until the badge is hovered or focused: then they slide in from 6px left and scale 0.8 → 1 with a fade (slow spring), ${SOCIAL_STAGGER_MS}ms apart, left to right, and leave together (slow exit). Always visible on touch screens (hover: none). Hovering one scales it to 1.06 (fast spring). Accessible name "{Network}${config.click.link.newTab ? ', opens in a new tab' : ''}".`,
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
  if (profile) {
    out.push(
      `- The badge is a <button type="button"> named "${text ? `${text}, open profile` : 'Open profile'}", with aria-haspopup="dialog" and aria-controls pointing at the dialog.`,
      '- The modal is a native <dialog> opened with showModal(): focus moves into it and stays there, Escape closes it, and focus returns to the badge. It is labelled by the name heading.',
      '- The close button is named "Close". Links that open in a new tab say so in their name.',
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

  section('Reference implementation')
  out.push('Standalone HTML/CSS' + (profile ? '/JS' : '') + ', tested in Chrome, Safari and Firefox:', '', '```html', reference.trimEnd(), '```')

  section('Acceptance criteria')
  out.push(
    `1. Rendering: the page shows the badge at ${size.height}px high with the exact colors, radius, border and shadow above, in ${adaptToSite ? 'both light and dark site themes' : 'the page'}.`,
    '2. Hover: the arrow slides 2px up-right and the shadow grows, with no layout shift.',
    profile
      ? '3. Open/close: a click opens the profile modal centered over a dimmed page; the close button, Escape and a click on the backdrop close it.'
      : `3. Click: the badge opens ${config.click.link.url || 'its link'}${config.click.link.newTab ? ' in a new tab' : ''}.`,
    profile
      ? '4. Keyboard: Tab reaches the badge, Enter/Space opens the modal, focus stays inside it until Escape, then returns to the badge; the focus ring is visible.'
      : '4. Keyboard: Tab reaches the badge, the focus ring is visible, Enter follows the link.',
    '5. Reduced motion: with prefers-reduced-motion enabled, nothing moves; changes are instant or fades.',
  )
  return out.join('\n') + '\n'
}
