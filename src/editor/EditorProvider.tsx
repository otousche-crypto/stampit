import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { checkPalette, type ContrastIssue } from '@/badge/contrast'
import { generateBadge, type GeneratedBadge } from '@/badge/export/generateHtml'
import { activePaletteKey } from '@/badge/presets'
import { createDefaultConfig, type BadgeConfig, type Palette, type PaletteKey } from '@/badge/schema'
import { validate, type EditorErrors } from './validation'
import { setAppearance, useAppearance } from '@/app/appearance'

export type PreviewBackground = 'light' | 'dark'
export type EditorNotice = 'invalid-link' | 'missing-photo'

/** Preview backdrops: Décadi's panel grey, and a matching night. */
export const PREVIEW_BACKDROPS: Record<PreviewBackground, string> = {
  light: '#F2F2F7',
  dark: '#1C1C1E',
}

type EditorContextValue = {
  config: BadgeConfig
  /** Every edit goes through here; `updatedAt` is stamped automatically. */
  update: (updater: (config: BadgeConfig) => BadgeConfig) => void
  replace: (config: BadgeConfig) => void

  previewBackground: PreviewBackground
  setPreviewBackground: (bg: PreviewBackground) => void
  /** Preview scale: 2× on large screens, 1× on phones (no control). */
  zoom: 1 | 2

  /** Palette the colour controls edit (follows the preview background when adapting). */
  editingKey: PaletteKey
  editingPalette: Palette

  uploadDataUrl: string | null
  setUploadDataUrl: (dataUrl: string | null) => void
  avatarFailed: boolean
  setAvatarFailed: (failed: boolean) => void

  /** Non-blocking notice from loading (bad link, photo not in the link). */
  notice: EditorNotice | null
  dismissNotice: () => void
  /** Start over with a fresh default badge. */
  reset: () => void

  /** Replays the appear animation in the preview (it doesn't replay on edits). */
  replayEntrance: () => void
  /** Changes on each replay, to re-mount the preview. */
  entranceKey: number

  errors: EditorErrors
  contrastIssues: ContrastIssue[]
  /** What the preview renders (scheme forced to the preview background). */
  preview: GeneratedBadge
}

/** Long enough for the slowest appear animation (Shine: 0.2 s delay + 0.9 s). Not an animation timing. */
const ENTRANCE_WINDOW_MS = 1500

const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}

type EditorProviderProps = {
  initialConfig: BadgeConfig
  initialUpload?: string | null
  initialNotice?: EditorNotice | null
  onChange?: (config: BadgeConfig) => void
  onUploadChange?: (id: string, dataUrl: string | null) => void
  children: ReactNode
}

export function EditorProvider({
  initialConfig,
  initialUpload = null,
  initialNotice = null,
  onChange,
  onUploadChange,
  children,
}: EditorProviderProps) {
  const [config, setConfig] = useState(initialConfig)
  const [notice, setNotice] = useState<EditorNotice | null>(initialNotice)
  // The preview backdrop is the site's Light / Dark (one sticky switch).
  const previewBackground: PreviewBackground = useAppearance()
  const setPreviewBackground = setAppearance
  // 2× by default; 1× on phones, where a 2× badge wouldn't fit.
  const [zoom] = useState<1 | 2>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 1 : 2,
  )
  const [uploadDataUrl, setUploadState] = useState<string | null>(initialUpload)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const update = useCallback((updater: (config: BadgeConfig) => BadgeConfig) => {
    setConfig((prev) => ({ ...updater(prev), updatedAt: new Date().toISOString() }))
  }, [])

  const replace = useCallback((next: BadgeConfig) => setConfig(next), [])

  const setUploadDataUrl = useCallback(
    (dataUrl: string | null) => {
      setUploadState(dataUrl)
      onUploadChange?.(config.id, dataUrl)
      if (dataUrl) setNotice((n) => (n === 'missing-photo' ? null : n))
    },
    [config.id, onUploadChange],
  )

  const reset = useCallback(() => {
    onUploadChange?.(config.id, null)
    setUploadState(null)
    setAvatarFailed(false)
    setNotice(null)
    setConfig(createDefaultConfig())
  }, [config.id, onUploadChange])

  // Report changes (persistence), skipping the initial config.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    onChangeRef.current?.(config)
  }, [config])

  const editingKey = activePaletteKey(config, previewBackground)
  const editingPalette = config.theme.palettes[editingKey]
  const errors = useMemo(() => validate(config), [config])

  const contrastIssues = useMemo(
    () =>
      checkPalette(editingPalette, PREVIEW_BACKDROPS[previewBackground], {
        hasNormalText: Boolean(config.text.normal.trim()),
        hasBoldText: Boolean(config.text.bold.trim()),
        hasIcon: config.shape.showIcon,
        hasBorder: config.shape.borderWidth > 0,
      }),
    [editingPalette, previewBackground, config.text.normal, config.text.bold, config.shape.showIcon, config.shape.borderWidth],
  )

  // The appear animation plays on load, on Replay and when it is changed;
  // edits re-render the preview without it, so the badge doesn't shake on
  // every keystroke.
  const [entranceLive, setEntranceLive] = useState(true)
  const [entranceKey, setEntranceKey] = useState(0)
  const replayEntrance = useCallback(() => {
    setEntranceLive(true)
    setEntranceKey((k) => k + 1)
  }, [])
  useEffect(() => {
    if (!entranceLive) return
    const t = window.setTimeout(() => setEntranceLive(false), ENTRANCE_WINDOW_MS)
    return () => window.clearTimeout(t)
  }, [entranceLive, entranceKey])
  const firstEntrance = useRef(true)
  useEffect(() => {
    if (firstEntrance.current) {
      firstEntrance.current = false
      return
    }
    replayEntrance()
  }, [config.motion.entrance, replayEntrance])

  const preview = useMemo(
    () =>
      generateBadge(config, {
        uploadDataUrl,
        avatarFailed,
        previewScheme: config.theme.adaptToSite ? previewBackground : undefined,
        skipEntrance: !entranceLive,
        staticPosition: true,
      }),
    [config, uploadDataUrl, avatarFailed, previewBackground, entranceLive],
  )

  const value: EditorContextValue = {
    config,
    update,
    replace,
    previewBackground,
    setPreviewBackground,
    zoom,
    editingKey,
    editingPalette,
    uploadDataUrl,
    setUploadDataUrl,
    avatarFailed,
    setAvatarFailed,
    notice,
    dismissNotice: () => setNotice(null),
    reset,
    replayEntrance,
    entranceKey,
    errors,
    contrastIssues,
    preview,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
