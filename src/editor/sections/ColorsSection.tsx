import { enableAdaptToSite } from '@/badge/presets'
import { SwitchRow } from '../controls'
import { useEditor } from '../EditorProvider'

export function ColorsSection() {
  const { config, update, previewBackground, setPreviewBackground } = useEditor()
  const adapt = config.theme.adaptToSite

  const toggleAdapt = () => {
    if (!adapt) {
      const next = enableAdaptToSite(config)
      setPreviewBackground(next.theme.base)
      update(() => next)
    } else {
      // Back to one palette: keep the one on screen.
      update((c) => ({ ...c, theme: { ...c.theme, adaptToSite: false, base: previewBackground } }))
    }
  }

  return <SwitchRow label="Adapt to site theme" checked={adapt} onToggle={toggleAdapt} />
}
