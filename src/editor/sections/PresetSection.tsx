import { ColorPickerPopover } from '@/components/ui/color-picker'
import { applyPreset, matchPreset, PRESET_LABELS, type FixedPreset } from '@/badge/presets'
import { DEFAULT_BRAND_COLOR } from '@/badge/schema'
import { Choice, Hint, normalizeHex } from '../controls'
import { useEditor } from '../EditorProvider'

const OPTIONS = (Object.keys(PRESET_LABELS) as FixedPreset[]).map((value) => ({ value, label: PRESET_LABELS[value] }))

export function PresetSection() {
  const { config, update, editingKey, editingPalette, previewBackground } = useEditor()
  const brandColor = config.brandColor ?? DEFAULT_BRAND_COLOR
  // The radio reflects the palette being edited; manual edits leave it empty.
  const current = config.preset === 'custom' ? null : matchPreset(editingPalette, brandColor)

  return (
    <section aria-label="Preset" className="px-3 pt-3 pb-2">
      <Choice
        label="Preset"
        options={OPTIONS}
        value={current}
        onChange={(preset) => update((c) => applyPreset(c, preset, editingKey))}
      />
      {current === 'brand' && (
        <div className="pt-2 [&>div]:flex [&>div]:w-full">
          <ColorPickerPopover
            size="compact"
            triggerLabel="Brand color"
            triggerClassName="w-full justify-between"
            value={brandColor}
            onValueChange={(_, parsed) => {
              const hex = normalizeHex(parsed.hex)?.slice(0, 7)
              if (hex && hex !== brandColor) update((c) => applyPreset({ ...c, brandColor: hex }, 'brand', editingKey, hex))
            }}
          />
        </div>
      )}
      {current === 'glass' && previewBackground === 'light' && <Hint>Glass works best on dark backgrounds.</Hint>}
    </section>
  )
}
