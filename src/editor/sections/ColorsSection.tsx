import { Banner, BannerDescription, BannerTitle } from '@/components/ui/banner'
import { Switch } from '@/components/ui/switch'
import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'
import type { ContrastField } from '@/badge/contrast'
import { enableAdaptToSite } from '@/badge/presets'
import type { Palette } from '@/badge/schema'
import { ColorField } from '../controls'
import { useEditor } from '../EditorProvider'

const FIELDS: { key: keyof Omit<Palette, 'blur'>; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'border', label: 'Border' },
  { key: 'textNormal', label: 'Normal text' },
  { key: 'textBold', label: 'Bold text' },
  { key: 'icon', label: 'Icon' },
]

const ISSUE_LABELS: Record<ContrastField, string> = {
  textNormal: 'Normal text',
  textBold: 'Bold text',
  icon: 'Icon',
  border: 'Border',
}

export function ColorsSection() {
  const { config, update, editingKey, editingPalette, contrastIssues, previewBackground, setPreviewBackground } =
    useEditor()
  const adapt = config.theme.adaptToSite

  const setColor = (key: keyof Palette, hex: string) =>
    update((c) => ({
      ...c,
      preset: 'custom',
      theme: {
        ...c.theme,
        palettes: { ...c.theme.palettes, [editingKey]: { ...c.theme.palettes[editingKey], [key]: hex } },
      },
    }))

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

  return (
    <div className="flex flex-col gap-3">
      <Switch label="Adapt to site theme" checked={adapt} onToggle={toggleAdapt} size="compact" />
      {adapt && (
        <TabsSubtle
          idPrefix="palette"
          size="compact"
          selectedIndex={previewBackground === 'light' ? 0 : 1}
          onSelect={(i) => setPreviewBackground(i === 0 ? 'light' : 'dark')}
        >
          <TabsSubtleItem index={0} label="Light" />
          <TabsSubtleItem index={1} label="Dark" />
        </TabsSubtle>
      )}
      <div
        className="flex flex-col gap-1.5"
        role={adapt ? 'tabpanel' : undefined}
        id={adapt ? `palette-panel-${previewBackground === 'light' ? 0 : 1}` : undefined}
        aria-labelledby={adapt ? `palette-tab-${previewBackground === 'light' ? 0 : 1}` : undefined}
      >
        {FIELDS.map(({ key, label }) => (
          <ColorField
            key={`${editingKey}-${key}`}
            label={label}
            value={editingPalette[key]}
            onChange={(hex) => setColor(key, hex)}
            issue={key === 'background' ? undefined : contrastIssues.find((i) => i.field === key)}
          />
        ))}
      </div>
      {contrastIssues.length > 0 && (
        <Banner status="warning" size="compact">
          <BannerTitle>Some colors may be hard to read</BannerTitle>
          <BannerDescription>
            {contrastIssues.map((i) => ISSUE_LABELS[i.field]).join(', ')}{' '}
            {contrastIssues.length > 1 ? 'have' : 'has'} low contrast with the background. You can still export.
          </BannerDescription>
        </Banner>
      )}
    </div>
  )
}
