import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { SwitchRow } from '../controls'
import { SocialLinks } from '../SocialLinks'
import { useEditor } from '../EditorProvider'

type Click = BadgeConfig['click']

/**
 * Without a Pop, the badge is a link: its address, the social links that
 * slide out beside it, and whether it opens a new tab.
 */
export function LinkSettings() {
  const { config, update, errors, errorsShown } = useEditor()
  const link = config.click.link
  const [touched, setTouched] = useState(false)
  const setLink = (patch: Partial<Click['link']>) =>
    update((c) => ({ ...c, click: { ...c.click, link: { ...c.click.link, ...patch } } }))

  return (
    <div className="flex flex-col gap-2">
      <InputGroup size="compact" className="w-full">
        <div
          data-field="linkUrl"
          onBlur={() => {
            setTouched(true)
            const normalized = normalizeUrl(link.url)
            if (normalized !== link.url) setLink({ url: normalized })
          }}
        >
          <InputField
            index={0}
            label="Link"
            type="url"
            inputMode="url"
            autoComplete="url"
            icon={Link2}
            placeholder="yoursite.com"
            value={link.url}
            error={touched || errorsShown ? errors.linkUrl : undefined}
            onChange={(url) => setLink({ url })}
          />
        </div>
      </InputGroup>
      <SocialLinks />
      <SwitchRow label="Open in new tab" checked={link.newTab} onToggle={() => setLink({ newTab: !link.newTab })} />
    </div>
  )
}
