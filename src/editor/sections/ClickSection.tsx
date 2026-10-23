import { useEffect, useState } from 'react'
import { Link2 } from 'lucide-react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { SwitchRow } from '../controls'
import { SocialLinks } from '../SocialLinks'
import { useEditor } from '../EditorProvider'

type Click = BadgeConfig['click']

/**
 * The badge is always a link; more links go in the social bubbles. (The
 * Bubbles menu mode stays in the generator but is no longer offered.)
 */
export function ClickSection() {
  const { config, update, errors, errorsShown } = useEditor()
  const click = config.click
  const [touched, setTouched] = useState(false)
  const setLink = (patch: Partial<Click['link']>) =>
    update((c) => ({ ...c, click: { ...c.click, link: { ...c.click.link, ...patch } } }))

  // Badges saved in Bubbles mode come back as a link.
  useEffect(() => {
    if (click.mode !== 'link') update((c) => ({ ...c, click: { ...c.click, mode: 'link' } }))
  }, [click.mode, update])

  return (
    <div className="flex flex-col gap-2">
      <InputGroup size="compact" className="w-full">
        <div
          data-field="linkUrl"
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
            error={touched || errorsShown ? errors.linkUrl : undefined}
            onChange={(url) => setLink({ url })}
          />
        </div>
      </InputGroup>
      <SocialLinks />
      <SwitchRow label="Open in new tab" checked={click.link.newTab} onToggle={() => setLink({ newTab: !click.link.newTab })} />
    </div>
  )
}
