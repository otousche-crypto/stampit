import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { checkPalette, type ContrastIssue } from '@/badge/contrast'
import { generateBadge, type GeneratedBadge } from '@/badge/export/generateHtml'
import { activePaletteKey } from '@/badge/presets'
import { createDefaultConfig, type BadgeConfig, type Palette, type PaletteKey } from '@/badge/schema'
import { validate, type EditorErrors } from './validation'

export type PreviewBackground = 'light' | 'dark'
export type PreviewDevice = 'desktop' | 'mobile'
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
  zoom: 1 | 2
  setZoom: (zoom: 1 | 2) => void
  /** Preview device: the bare stage, or a phone-sized viewport. */
  device: PreviewDevice
  setDevice: (device: PreviewDevice) => void

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

  errors: EditorErrors
  contrastIssues: ContrastIssue[]
  /** What the preview renders (scheme forced to the preview background). */
  preview: GeneratedBadge
}

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
  const [previewBackground, setPreviewBackground] = useState<PreviewBackground>(
    initialConfig.theme.adaptToSite ? 'light' : initialConfig.theme.base,
  )
  // 2× by default; 1× on phones, where a 2× badge wouldn't fit.
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [zoom, setZoom] = useState<1 | 2>(() =>
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
    setPreviewBackground('light')
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

  const preview = useMemo(
    () =>
      generateBadge(config, {
        uploadDataUrl,
        avatarFailed,
        previewScheme: config.theme.adaptToSite ? previewBackground : undefined,
      }),
    [config, uploadDataUrl, avatarFailed, previewBackground],
  )

  const value: EditorContextValue = {
    config,
    update,
    replace,
    previewBackground,
    setPreviewBackground,
    zoom,
    setZoom,
    device,
    setDevice,
    editingKey,
    editingPalette,
    uploadDataUrl,
    setUploadDataUrl,
    avatarFailed,
    setAvatarFailed,
    notice,
    dismissNotice: () => setNotice(null),
    reset,
    errors,
    contrastIssues,
    preview,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
