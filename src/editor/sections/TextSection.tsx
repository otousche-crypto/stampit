import { InputField, InputGroup } from '@/components/ui/input-group'
import type { BadgeConfig } from '@/badge/schema'
import { Suggestions, WELL_FIELD } from '../controls'
import { useEditor } from '../EditorProvider'

const NORMAL_SUGGESTIONS = ['Made by', 'Launched by', 'Built by', 'Designed by']
const STATUS_SUGGESTIONS = ['Open to work', 'Booking for Q1', 'Taking new clients']

/** Up to five teammates after the bold text. */
const MAX_TEAM = 5

type Text = BadgeConfig['text']

export function TextSection({ autoFocusBold }: { autoFocusBold?: boolean }) {
  const { config, update, errors } = useEditor()
  const text = config.text
  const layout = config.layout
  const set = (patch: Partial<Text>) => update((c) => ({ ...c, text: { ...c.text, ...patch } }))
  const status = layout === 'status'

  // Always one empty field at the end to add a teammate; clearing a field removes it.
  const teamFields = config.team.length < MAX_TEAM ? [...config.team, ''] : config.team
  const setTeammate = (index: number, name: string) =>
    update((c) => {
      const team = [...c.team]
      team[index] = name
      return { ...c, team: team.filter((n) => n !== '') }
    })

  return (
    <div className="flex flex-col gap-1">
      {/* Side by side: one InputGroup each, so each keeps its own vertical hover scope. */}
      <div className="grid grid-cols-2 gap-2">
        <InputGroup size="compact" className="w-full">
          {status ? (
            <InputField
              index={0}
              label="Status"
              className={WELL_FIELD}
              placeholder="Available for work"
              value={text.status}
              maxLength={32}
              onChange={(value) => set({ status: value })}
            />
          ) : (
            <InputField
              index={0}
              label="Normal text"
              className={WELL_FIELD}
              placeholder="Crafted by"
              value={text.normal}
              maxLength={24}
              onChange={(normal) => set({ normal })}
            />
          )}
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
      {status ? (
        <Suggestions label="Status suggestions" items={STATUS_SUGGESTIONS} onPick={(value) => set({ status: value })} />
      ) : (
        <Suggestions label="Suggestions" items={NORMAL_SUGGESTIONS} onPick={(normal) => set({ normal })} />
      )}

      {layout === 'card' && (
        <InputGroup size="compact" className="mt-2 w-full">
          <InputField
            index={0}
            label="Role"
            className={WELL_FIELD}
            placeholder="Product designer"
            value={text.role}
            maxLength={40}
            onChange={(role) => set({ role })}
          />
        </InputGroup>
      )}

      {layout === 'team' && (
        <InputGroup size="compact" className="mt-2 w-full">
          {teamFields.map((name, i) => (
            <InputField
              key={i}
              index={i}
              label={`Teammate ${i + 1}`}
              className={WELL_FIELD}
              placeholder="Add a name"
              value={name}
              maxLength={32}
              onChange={(value) => setTeammate(i, value)}
            />
          ))}
        </InputGroup>
      )}
    </div>
  )
}
