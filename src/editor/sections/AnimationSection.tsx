import { Activity, ArrowUp, Ban, Maximize2, Sparkles, Vibrate } from 'lucide-react'
import type { BadgeConfig, Entrance, HoverEffect } from '@/badge/schema'
import { RowList, SelectRow } from '../controls'
import { useEditor } from '../EditorProvider'

type Motion = BadgeConfig['motion']

const ENTRANCE_OPTIONS: { value: Entrance; label: string; icon: typeof Ban }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'shake', label: 'Shake', icon: Vibrate },
  { value: 'bump', label: 'Bump', icon: Maximize2 },
  { value: 'shine', label: 'Shine', icon: Sparkles },
]

const HOVER_OPTIONS: { value: HoverEffect; label: string; icon: typeof Ban }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'grow', label: 'Grow', icon: Maximize2 },
  { value: 'lift', label: 'Lift', icon: ArrowUp },
  { value: 'pulse', label: 'Pulse', icon: Activity },
  { value: 'shake', label: 'Shake', icon: Vibrate },
]

export function AnimationSection() {
  const { config, update, previewMotion } = useEditor()
  const set = (patch: Partial<Motion>) => update((c) => ({ ...c, motion: { ...c.motion, ...patch } }))
  return (
    <RowList>
      <SelectRow label="On appear" value={config.motion.entrance} onChange={(entrance) => set({ entrance })} onPreview={(v) => previewMotion('entrance', v)} options={ENTRANCE_OPTIONS} />
      <SelectRow label="On delay" value={config.motion.repeat} onChange={(repeat) => set({ repeat })} onPreview={(v) => previewMotion('repeat', v)} options={ENTRANCE_OPTIONS} />
      <SelectRow label="On hover" value={config.motion.hover} onChange={(hover) => set({ hover })} onPreview={(v) => previewMotion('hover', v)} options={HOVER_OPTIONS} />
    </RowList>
  )
}
