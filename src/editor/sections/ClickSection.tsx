import { useState } from 'react'
import { Link2, UserRound } from 'lucide-react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { Hint, SelectRow, SwitchRow, WELL_FIELD, type SelectRowOption } from '../controls'
import { SocialLinks } from '../SocialLinks'
import { ProjectsEditor } from '../ProjectsEditor'
import { useEditor } from '../EditorProvider'

type Click = BadgeConfig['click']

const MODES: SelectRowOption<Click['mode']>[] = [
  { value: 'link', label: 'Link', icon: Link2 },
  { value: 'profile', label: 'Profile', icon: UserRound },
]

/**
 * Link: the badge goes to one address, the social links slide out beside it.
 * Profile: the badge opens a modal with the bio, portfolio, social links,
 * GitHub activity and projects.
 */
export function ClickSection() {
  const { config, update, errors, errorsShown } = useEditor()
  const click = config.click
  const profile = click.mode === 'profile'
  const [touched, setTouched] = useState(false)
  const setLink = (patch: Partial<Click['link']>) =>
    update((c) => ({ ...c, click: { ...c.click, link: { ...c.click.link, ...patch } } }))
  const setBio = (bio: string) => update((c) => ({ ...c, click: { ...c.click, profile: { ...c.click.profile, bio } } }))

  return (
    <div className="flex flex-col gap-2">
      <SelectRow
        label="On click"
        options={MODES}
        value={click.mode}
        onChange={(mode) => update((c) => ({ ...c, click: { ...c.click, mode } }))}
      />
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
            label={profile ? 'Portfolio' : 'URL'}
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
      {profile && (
        <InputGroup size="compact" className="w-full">
          <InputField
            index={0}
            label="Bio"
            className={WELL_FIELD}
            placeholder="Designer shipping small, useful tools."
            maxLength={160}
            value={click.profile.bio}
            onChange={setBio}
          />
        </InputGroup>
      )}
      <SocialLinks />
      {profile && !config.socials.github.trim() && <Hint>Add your GitHub link to show your activity.</Hint>}
      {profile && <ProjectsEditor />}
      <SwitchRow label="Open in new tab" checked={click.link.newTab} onToggle={() => setLink({ newTab: !click.link.newTab })} />
    </div>
  )
}
