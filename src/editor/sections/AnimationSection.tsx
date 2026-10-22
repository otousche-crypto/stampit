import { Activity, ArrowUp, Ban, Eye, Maximize2, Vibrate } from 'lucide-react'
import type { BadgeConfig, Entrance, HoverEffect } from '@/badge/schema'
import { SelectRow } from '../controls'
import { useEditor } from '../EditorProvider'

type Motion = BadgeConfig['motion']

const ENTRANCE_OPTIONS: { value: Entrance; label: string; icon: typeof Ban }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'fade', label: 'Fade', icon: Eye },
  { value: 'grow', label: 'Grow', icon: Maximize2 },
  { value: 'slide', label: 'Slide up', icon: ArrowUp },
  { value: 'pulse', label: 'Pulse', icon: Activity },
  { value: 'shake', label: 'Shake', icon: Vibrate },
]

const HOVER_OPTIONS: { value: HoverEffect; label: string; icon: typeof Ban }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'grow', label: 'Grow', icon: Maximize2 },
  { value: 'lift', label: 'Lift', icon: ArrowUp },
  { value: 'pulse', label: 'Pulse', icon: Activity },
  { value: 'shake', label: 'Shake', icon: Vibrate },
]

export function AnimationSection() {
  const { config, update } = useEditor()
  const set = (patch: Partial<Motion>) => update((c) => ({ ...c, motion: { ...c.motion, ...patch } }))
  return (
    <div className="flex flex-col">
      <SelectRow label="On appear" value={config.motion.entrance} onChange={(entrance) => set({ entrance })} options={ENTRANCE_OPTIONS} />
      <SelectRow label="On hover" value={config.motion.hover} onChange={(hover) => set({ hover })} options={HOVER_OPTIONS} />
    </div>
  )
}
