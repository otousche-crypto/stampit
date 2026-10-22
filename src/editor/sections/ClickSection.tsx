import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { Choice } from '../controls'
import { useEditor } from '../EditorProvider'

type Click = BadgeConfig['click']

export function ClickSection() {
  const { config, update, errors } = useEditor()
  const click = config.click
  const [touched, setTouched] = useState(false)
  const setLink = (patch: Partial<Click['link']>) =>
    update((c) => ({ ...c, click: { ...c.click, link: { ...c.click.link, ...patch } } }))

  return (
    <div className="flex flex-col gap-4">
      <Choice
        label="Mode"
        value={click.mode}
        onChange={(mode) => update((c) => ({ ...c, click: { ...c.click, mode } }))}
        options={[
          { value: 'link', label: 'Link' },
          { value: 'bubbles', label: 'Bubbles' },
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
          <Switch
            label="Open in new tab"
            checked={click.link.newTab}
            onToggle={() => setLink({ newTab: !click.link.newTab })}
            size="compact"
          />
        </>
      )}
    </div>
  )
}
