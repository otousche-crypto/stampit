import { InputField, InputGroup } from '@/components/ui/input-group'
import type { BadgeConfig } from '@/badge/schema'
import { Suggestions, WELL_FIELD } from '../controls'
import { useEditor } from '../EditorProvider'

const NORMAL_SUGGESTIONS = ['Made by', 'Launched by', 'Built by', 'Designed by']

type Text = BadgeConfig['text']

export function TextSection({ autoFocusBold }: { autoFocusBold?: boolean }) {
  const { config, update, errors } = useEditor()
  const text = config.text
  const set = (patch: Partial<Text>) => update((c) => ({ ...c, text: { ...c.text, ...patch } }))

  return (
    <div className="flex flex-col gap-1">
      {/* Side by side: one InputGroup each, so each keeps its own vertical hover scope. */}
      <div className="grid grid-cols-2 gap-2">
        <InputGroup size="compact" className="w-full">
          <InputField
            index={0}
            label="Normal text"
            className={WELL_FIELD}
            placeholder="Crafted by"
            value={text.normal}
            maxLength={24}
            onChange={(normal) => set({ normal })}
          />
        </InputGroup>
        <InputGroup size="compact" className="w-full">
          <InputField
            index={0}
            label="Bold text"
            className={WELL_FIELD}
            placeholder="Your Name"
            value={text.bold}
            maxLength={32}
            autoFocus={autoFocusBold}
            error={errors.text}
            onChange={(bold) => set({ bold })}
          />
        </InputGroup>
      </div>
      <Suggestions label="Suggestions" items={NORMAL_SUGGESTIONS} onPick={(normal) => set({ normal })} />
    </div>
  )
}
