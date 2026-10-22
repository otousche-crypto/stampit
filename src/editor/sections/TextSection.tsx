import { InputField, InputGroup } from '@/components/ui/input-group'
import type { BadgeConfig } from '@/badge/schema'
import { Choice, Suggestions } from '../controls'
import { useEditor } from '../EditorProvider'

const NORMAL_SUGGESTIONS = ['Made by', 'Launched by', 'Built by', 'Designed by', 'Crafted by']

type Text = BadgeConfig['text']

export function TextSection({ autoFocusBold }: { autoFocusBold?: boolean }) {
  const { config, update, errors } = useEditor()
  const text = config.text
  const set = (patch: Partial<Text>) => update((c) => ({ ...c, text: { ...c.text, ...patch } }))

  return (
    <div className="flex flex-col gap-4">
      <InputGroup size="compact" className="w-full gap-2">
        <div>
          <InputField
            index={0}
            label="Normal text"
            placeholder="Made by"
            value={text.normal}
            maxLength={24}
            onChange={(normal) => set({ normal })}
          />
          <Suggestions label="Suggestions" items={NORMAL_SUGGESTIONS} onPick={(normal) => set({ normal })} />
        </div>
        <InputField
          index={1}
          label="Bold text"
          placeholder="Your Name"
          value={text.bold}
          maxLength={32}
          autoFocus={autoFocusBold}
          error={errors.text}
          onChange={(bold) => set({ bold })}
        />
      </InputGroup>
      <Choice
          label="Order"
          value={text.order}
          onChange={(order) => set({ order })}
          options={[
            { value: 'normal-first', label: 'Normal → Bold' },
            { value: 'bold-first', label: 'Bold → Normal' },
          ]}
        />
      <div className="grid grid-cols-3 gap-1">
        <Choice
          label="Bold weight"
          value={String(text.boldWeight) as '400' | '500' | '600'}
          onChange={(w) => set({ boldWeight: Number(w) as Text['boldWeight'] })}
          options={[
            { value: '400', label: 'Regular' },
            { value: '500', label: 'Medium' },
            { value: '600', label: 'Semibold' },
          ]}
        />
        <Choice
          label="Size"
          value={text.size}
          onChange={(size) => set({ size })}
          options={[
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'l', label: 'L' },
          ]}
        />
        <Choice
          label="Font"
          value={text.font}
          onChange={(font) => set({ font })}
          options={[
            { value: 'sans', label: 'Sans' },
            { value: 'serif', label: 'Serif' },
            { value: 'mono', label: 'Mono' },
          ]}
        />
      </div>
    </div>
  )
}
