import { useState } from 'react'
import { ArrowDown, Link2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { Hint, SelectRow, SwitchRow, type SelectRowOption } from '../controls'
import { SocialLinks } from '../SocialLinks'
import { useEditor } from '../EditorProvider'

type Click = BadgeConfig['click']

/** Smooth scroll to one of the editor screens (`create`, `profile`). */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}

const MODES: SelectRowOption<Click['mode']>[] = [
  { value: 'link', label: 'Link', icon: Link2 },
  { value: 'profile', label: 'Profile', icon: UserRound },
]

/**
 * Link: the badge goes to one address, the social links slide out beside it.
 * Profile: the badge opens a modal, designed in the profile editor one
 * scroll below.
 */
export function ClickSection() {
  const { config, update, errors, errorsShown } = useEditor()
  const click = config.click
  const profile = click.mode === 'profile'
  const [touched, setTouched] = useState(false)
  const setLink = (patch: Partial<Click['link']>) =>
    update((c) => ({ ...c, click: { ...c.click, link: { ...c.click.link, ...patch } } }))

  return (
    <div className="flex flex-col gap-2">
      <SelectRow
        label="On click"
        options={MODES}
        value={click.mode}
        onChange={(mode) => update((c) => ({ ...c, click: { ...c.click, mode } }))}
      />
      {profile ? (
        <>
          <Hint>Your bio, links, GitHub activity and projects are set in the profile editor.</Hint>
          <Button variant="secondary" size="compact" trailingIcon={ArrowDown} className="self-start" onClick={() => scrollToSection('profile')}>
            Edit profile
          </Button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
