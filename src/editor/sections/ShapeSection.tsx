import { Circle, Square } from 'lucide-react'
import type { BadgeConfig } from '@/badge/schema'
import { SelectRow, SwitchRow } from '../controls'
import { useEditor } from '../EditorProvider'

type Shape = BadgeConfig['shape']

/** "Rounded": a small corner, a third of the capsule radius (6px at size M). */
const ROUNDED_RADIUS = 1 / 3

export function ShapeSection() {
  const { config, update } = useEditor()
  const shape = config.shape
  const set = (patch: Partial<Shape>) => update((c) => ({ ...c, shape: { ...c.shape, ...patch } }))

  return (
    <div className="flex flex-col">
      <SelectRow
        label="Radius"
        value={shape.radius >= 0.5 ? 'pill' : 'rounded'}
        onChange={(v) => set({ radius: v === 'pill' ? 1 : ROUNDED_RADIUS })}
        options={[
          { value: 'rounded', label: 'Rounded', icon: Square },
          { value: 'pill', label: 'Pill', icon: Circle },
        ]}
      />
      <SelectRow
        label="Border"
        value={String(shape.borderWidth) as '0' | '1' | '2'}
        onChange={(w) => set({ borderWidth: Number(w) as Shape['borderWidth'] })}
        options={[
          { value: '0', label: 'None' },
          { value: '1', label: '1 px' },
          { value: '2', label: '2 px' },
        ]}
      />
      <SelectRow
        label="Shadow"
        value={shape.shadow}
        onChange={(shadow) => set({ shadow })}
        options={[
          { value: 'none', label: 'None' },
          { value: 'soft', label: 'Soft' },
        ]}
      />
      <SwitchRow label="Show icon" checked={shape.showIcon} onToggle={() => set({ showIcon: !shape.showIcon })} />
    </div>
  )
}
