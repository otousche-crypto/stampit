import { useState } from 'react'
import { Link2, Shapes } from 'lucide-react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { Hint, SelectRow, SwitchRow } from '../controls'
import { ChannelsEditor } from '../ChannelsEditor'
import { useEditor } from '../EditorProvider'

type Click = BadgeConfig['click']

export function ClickSection() {
  const { config, update, errors } = useEditor()
  const click = config.click
  const [touched, setTouched] = useState(false)
  const setLink = (patch: Partial<Click['link']>) =>
    update((c) => ({ ...c, click: { ...c.click, link: { ...c.click.link, ...patch } } }))

  return (
    <div className="flex flex-col gap-2">
      <SelectRow
        label="Mode"
        value={click.mode}
        onChange={(mode) => update((c) => ({ ...c, click: { ...c.click, mode } }))}
        options={[
          { value: 'link', label: 'Link', icon: Link2 },
          { value: 'bubbles', label: 'Bubbles', icon: Shapes },
        ]}
      />
      {click.mode === 'link' && (
        <>
          <InputGroup size="compact" className="w-full">
            <div
              onBlur={() => {
                setTouched(true)
                const normalized = normalizeUrl(click.link.url)
                if (normalized !== click.link.url) setLink({ url: normalized })
              }}
            >
            <InputField
              index={0}
              label="URL"
              type="url"
              inputMode="url"
              autoComplete="url"
              icon={Link2}
              placeholder="yoursite.com"
              value={click.link.url}
              error={touched ? errors.linkUrl : undefined}
              onChange={(url) => setLink({ url })}
            />
            </div>
          </InputGroup>
        </>
      )}
      {click.mode === 'bubbles' && (
        <>
          <ChannelsEditor />
          {errors.channels && click.bubbles.channels.length !== 1 && <Hint tone="error">{errors.channels}</Hint>}
          <SelectRow
            label="Labels"
            value={click.bubbles.labels}
            onChange={(labels) => update((c) => ({ ...c, click: { ...c.click, bubbles: { ...c.click.bubbles, labels } } }))}
            options={[
              { value: 'icon', label: 'Icon only' },
              { value: 'icon-label', label: 'Icon + label' },
            ]}
          />
        </>
      )}
      <SwitchRow label="Open in new tab" checked={click.link.newTab} onToggle={() => setLink({ newTab: !click.link.newTab })} />
    </div>
  )
}
