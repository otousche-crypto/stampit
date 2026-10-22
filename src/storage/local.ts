import type { BadgeConfig } from '@/badge/schema'

export const CONFIG_KEY = 'stampit:config'
export const avatarKey = (id: string) => `stampit:avatar:${id}`

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

export function loadAvatar(id: string): string | null {
  return read(avatarKey(id))
}

export function saveAvatar(id: string, dataUrl: string | null): void {
  write(avatarKey(id), dataUrl)
}
