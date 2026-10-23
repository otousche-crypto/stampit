import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { checkPalette, type ContrastIssue } from '@/badge/contrast'
import { generateBadge, type GeneratedBadge } from '@/badge/export/generateHtml'
import { HOVER_DEMO_ATTR } from '@/badge/render/BadgePreview'
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
  /**
   * Shows an animation option in the preview without picking it (an option
   * hovered or focused in its menu): it plays at once and stays shown until
   * `null` hands the preview back to the config.
   */
  previewMotion: (key: MotionKey, value: string | null) => void
  /** The preview plays its hover effect without the pointer on it. */
  hoverDemo: boolean

  errors: EditorErrors
  /**
   * Set when a copy was attempted with blocking errors: fields show their
   * error even if untouched, and the export column says what to fix.
   */
  errorsShown: boolean
  /** Shows the errors and takes the user to the first field to fix. */
  revealErrors: () => void
  /** Changes on each reveal (the mobile sheet closes on it). */
  revealKey: number
  contrastIssues: ContrastIssue[]
  /** What the preview renders (scheme forced to the preview background). */
  preview: GeneratedBadge
}

/** Long enough for the slowest appear animation (Shine: 0.2 s delay + 0.9 s). Not an animation timing. */
const ENTRANCE_WINDOW_MS = 1500

/** How long a newly picked hover effect is shown on the preview. Not an animation timing. */
const HOVER_DEMO_MS = 1200

export type MotionKey = keyof BadgeConfig['motion']

/** Runs `effect` when `value` changes, not on mount. */
function useOnChange<T>(value: T, effect: (value: T) => void) {
  const previous = useRef(value)
  useEffect(() => {
    if (Object.is(previous.current, value)) return
    previous.current = value
    effect(value)
  })
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
  const [errorsShown, setErrorsShown] = useState(false)
  const [revealKey, setRevealKey] = useState(0)
  const revealErrors = useCallback(() => {
    setErrorsShown(true)
    setRevealKey((k) => k + 1)
    // Fields carry data-field; the first one with an error gets scrolled to and focused.
    const order = [
      errors.text && 'text',
      errors.linkUrl && 'linkUrl',
      ...Object.keys(errors.social).map((network) => `social-${network}`),
    ].filter(Boolean) as string[]
    const target = order[0]
    if (!target) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const go = () => {
      const input = document.querySelector<HTMLInputElement>(`[data-field="${target}"] input`)
      if (!input) return false
      input.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' })
      input.focus({ preventScroll: true })
      return document.activeElement === input
    }
    // Once now (after the render that opens the social links), again once a
    // closing sheet has let go of the focus.
    requestAnimationFrame(() => {
      if (!go()) window.setTimeout(go, 250)
    })
  }, [errors])

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
  // An "On delay" effect to play now, as the appear animation: in the badge
  // it only starts after its first wait.
  const [entrancePlay, setEntrancePlay] = useState<BadgeConfig['motion']['repeat'] | null>(null)
  const replayEntrance = useCallback(() => {
    setEntrancePlay(null)
    setEntranceLive(true)
    setEntranceKey((k) => k + 1)
  }, [])
  const playRepeat = useCallback(
    (effect: string) => {
      if (effect === 'none') return
      replayEntrance()
      setEntrancePlay(effect as BadgeConfig['motion']['repeat'])
    },
    [replayEntrance],
  )
  useEffect(() => {
    if (!entranceLive) return
    const t = window.setTimeout(() => {
      setEntranceLive(false)
      setEntrancePlay(null)
    }, ENTRANCE_WINDOW_MS)
    return () => window.clearTimeout(t)
  }, [entranceLive, entranceKey])

  // Hover effect: held while its option is previewed, shown for a moment once picked.
  const [hoverHeld, setHoverHeld] = useState(false)
  const [hoverPicked, setHoverPicked] = useState(0)
  useEffect(() => {
    if (!hoverPicked) return
    const t = window.setTimeout(() => setHoverPicked(0), HOVER_DEMO_MS)
    return () => window.clearTimeout(t)
  }, [hoverPicked])

  // Picking an option plays it.
  useOnChange(config.motion.entrance, replayEntrance)
  useOnChange(config.motion.repeat, playRepeat)
  useOnChange(config.motion.hover, (hover) => {
    if (hover !== 'none') setHoverPicked((n) => n + 1)
  })

  // Previewing an option (hovered or focused in its menu) plays it too.
  const [motionPreview, setMotionPreview] = useState<{ key: MotionKey; value: string } | null>(null)
  const motionPreviewRef = useRef(motionPreview)
  const previewMotion = useCallback(
    (key: MotionKey, value: string | null) => {
      const current = motionPreviewRef.current
      if (value === null) {
        if (current?.key !== key) return
        motionPreviewRef.current = null
        setMotionPreview(null)
        if (key === 'hover') setHoverHeld(false)
        return
      }
      if (current?.key === key && current.value === value) return
      // Another menu's preview ends where this one starts.
      if (current?.key === 'hover' && key !== 'hover') setHoverHeld(false)
      motionPreviewRef.current = { key, value }
      setMotionPreview({ key, value })
      if (key === 'entrance') replayEntrance()
      if (key === 'repeat') playRepeat(value)
      if (key === 'hover') setHoverHeld(value !== 'none')
    },
    [replayEntrance, playRepeat],
  )

  const shown = useMemo(() => {
    let motion = config.motion
    if (motionPreview) motion = { ...motion, [motionPreview.key]: motionPreview.value }
    if (entrancePlay) motion = { ...motion, entrance: entrancePlay }
    return motion === config.motion ? config : { ...config, motion }
  }, [config, motionPreview, entrancePlay])

  const preview = useMemo(
    () =>
      generateBadge(shown, {
        uploadDataUrl,
        avatarFailed,
        previewScheme: shown.theme.adaptToSite ? previewBackground : undefined,
        skipEntrance: !entranceLive,
        hoverDemoAttr: HOVER_DEMO_ATTR,
      }),
    [shown, uploadDataUrl, avatarFailed, previewBackground, entranceLive],
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
    previewMotion,
    hoverDemo: hoverHeld || hoverPicked > 0,
    errors,
    errorsShown,
    revealErrors,
    revealKey,
    contrastIssues,
    preview,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
