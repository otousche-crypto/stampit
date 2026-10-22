import { useCallback, useEffect, useRef, useState } from 'react'
import { createDefaultConfig, parseConfig, type BadgeConfig } from '@/badge/schema'
import { EditorProvider, type EditorNotice } from '@/editor/EditorProvider'
import { EditorLayout } from '@/editor/EditorLayout'
import { loadAvatar, loadStoredConfig, saveAvatar, saveConfig } from '@/storage/local'
import { decodeConfig, encodeConfig, readHash } from '@/storage/url'

type Initial = { config: BadgeConfig; upload: string | null; notice: EditorNotice | null }

/** §6.2 — the hash first, then localStorage, then the defaults. */
async function loadInitial(): Promise<Initial> {
  let notice: EditorNotice | null = null
  let config: BadgeConfig | null = null

  const encoded = readHash(window.location.hash)
  if (encoded !== null) {
    const result = await decodeConfig(encoded)
    if (result.ok) config = result.config
    else notice = 'invalid-link'
  }
  if (!config && notice === null) {
    const stored = loadStoredConfig()
    if (stored) {
      const result = parseConfig(stored)
      if (result.ok) config = result.config
    }
  }
  config ??= createDefaultConfig()

  const upload = loadAvatar(config.id)
  if (config.avatar.source === 'upload' && !upload && notice === null) notice = 'missing-photo'
  return { config, upload, notice }
}

/** Autosave delay (§6.2). Not an animation timing. */
const SAVE_DELAY_MS = 300

/** `embedded`: the editor sits under the home page, so it must not grab focus (and scroll) on load. */
export function Create({ embedded = false }: { embedded?: boolean }) {
  const [initial, setInitial] = useState<Initial | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    loadInitial().then((loaded) => {
      if (!cancelled) setInitial(loaded)
    })
    return () => {
      cancelled = true
      window.clearTimeout(timer.current)
    }
  }, [])

  const persist = useCallback((config: BadgeConfig) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      saveConfig(config)
      try {
        const encoded = await encodeConfig(config)
        // replaceState: no history entry per keystroke.
        window.history.replaceState(window.history.state, '', `${window.location.pathname}#c=${encoded}`)
      } catch {
        /* the hash is a convenience; localStorage already has it */
      }
    }, SAVE_DELAY_MS)
  }, [])

  if (!initial) return <div className="h-dvh bg-background" aria-busy="true" />

  return (
    <EditorProvider
      initialConfig={initial.config}
      initialUpload={initial.upload}
      initialNotice={initial.notice}
      onChange={persist}
      onUploadChange={saveAvatar}
    >
      <EditorLayout autoFocus={!embedded} />
    </EditorProvider>
  )
}
