import { InputField, InputGroup } from '@/components/ui/input-group'
import type { BadgeConfig } from '@/badge/schema'
import { Suggestions } from '../controls'
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
    </div>
  )
}
