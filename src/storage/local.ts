import type { BadgeConfig } from '@/badge/schema'

export const CONFIG_KEY = 'stampit:config'

/** Private browsing or a full quota must never break the app: every access is guarded. */
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    /* no persistence */
  }
}

export function loadStoredConfig(): unknown | null {
  const raw = read(CONFIG_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function hasStoredConfig(): boolean {
  return read(CONFIG_KEY) !== null
}

export function saveConfig(config: BadgeConfig): void {
  write(CONFIG_KEY, JSON.stringify(config))
}

export function clearConfig(): void {
  write(CONFIG_KEY, null)
}

const EMBED_KEY = 'stampit:embed'
const PUBLISH_KEY = 'stampit:publish-key'

/** The hosted badge: its id (fixed after the first publish) and what was last published. */
export type EmbedState = { id: string; code: string; updatedAt: string }

export function loadEmbed(): EmbedState | null {
  try {
    const value = JSON.parse(read(EMBED_KEY) ?? 'null')
    return value && typeof value.id === 'string' ? (value as EmbedState) : null
  } catch {
    return null
  }
}

export function saveEmbed(state: EmbedState): void {
  write(EMBED_KEY, JSON.stringify(state))
}

/** The owner's publish key, kept in this browser only. */
export function loadPublishKey(): string {
  return read(PUBLISH_KEY) ?? ''
}

export function savePublishKey(key: string | null): void {
  write(PUBLISH_KEY, key)
}
