import { useState, type ReactNode } from 'react'
import { Heart, Mail } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { isValidUrl, normalizeUrl } from '@/badge/channels'
import { NEWSLETTER_PROVIDER_LABELS, newsletterTarget } from '@/badge/newsletter'
import type { BadgeConfig } from '@/badge/schema'
import { spring } from '@/lib/springs'
import { Hint, SwitchRow, WELL_FIELD } from './controls'
import { useEditor } from './EditorProvider'

type Profile = BadgeConfig['click']['profile']
export type PopSection = keyof Profile['sections']

/** Updates the Pop's settings (sections, newsletter, donate, projects). */
export function useSetProfile() {
  const { update } = useEditor()
  return (patch: Partial<Profile>) =>
    update((c) => ({ ...c, click: { ...c.click, profile: { ...c.click.profile, ...patch } } }))
}

/**
 * One of the modal's sections: a switch that shows it in the modal, and its
 * fields below while it's on.
 */
export function SectionToggle({ section, label, children }: { section: PopSection; label: string; children?: ReactNode }) {
  const { config } = useEditor()
  const setProfile = useSetProfile()
  const sections = config.click.profile.sections
  const on = sections[section]
  return (
    <div className="flex flex-col">
      <SwitchRow label={label} checked={on} onToggle={() => setProfile({ sections: { ...sections, [section]: !on } })} />
      <AnimatePresence initial={false}>
        {on && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: spring.moderate.exit }}
            transition={spring.moderate}
            className="overflow-hidden"
          >
            <div className="pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A link field that adds https:// on blur and shows its error once touched. */
function UrlField({
  field,
  label,
  placeholder,
  icon,
  value,
  error,
  onChange,
}: {
  field: string
  label: string
  placeholder: string
  icon: typeof Mail
  value: string
  error?: string
  onChange: (url: string) => void
}) {
  const { errorsShown } = useEditor()
  const [touched, setTouched] = useState(false)
  return (
    <div
      data-field={field}
      onBlur={() => {
        setTouched(true)
        const normalized = normalizeUrl(value)
        if (normalized !== value) onChange(normalized)
      }}
    >
      <InputField
        index={0}
        label={label}
        className={WELL_FIELD}
        type="url"
        inputMode="url"
        icon={icon}
        placeholder={placeholder}
        value={value}
        error={touched || errorsShown ? error : undefined}
        onChange={onChange}
      />
    </div>
  )
}

/** What Subscribe will do with the newsletter address: sign up in the modal, or open the page (and why). */
function newsletterHint(address: string): string | null {
  const url = address.trim()
  if (!isValidUrl(url)) return 'With Buttondown, Kit or Mailchimp, visitors subscribe right in the modal; with other services, Subscribe opens your page.'
  const target = newsletterTarget(url)
  if (target.kind === 'form') return `${NEWSLETTER_PROVIDER_LABELS[target.provider]}: visitors subscribe right in the modal.`
  switch (target.provider) {
    case 'kit':
      return "Subscribe opens this page. To sign visitors up in the modal, paste your Kit form's address (app.kit.com/forms/…/subscriptions)."
    case 'mailchimp':
      return "Subscribe opens this page. To sign visitors up in the modal, paste your Mailchimp form's address (…list-manage.com/subscribe/post?u=…&id=…)."
    case 'buttondown':
      return 'Subscribe opens this page. To sign visitors up in the modal, paste your Buttondown address (buttondown.com/you).'
    case null:
      return 'Subscribe opens this page in a new tab.'
    default:
      return `${NEWSLETTER_PROVIDER_LABELS[target.provider]} doesn't take sign-ups from other sites: Subscribe opens your page in a new tab.`
  }
}

/** Newsletter: where to subscribe, and an optional title and line above the field. */
export function NewsletterFields() {
  const { config, errors } = useEditor()
  const setProfile = useSetProfile()
  const newsletter = config.click.profile.newsletter
  const set = (patch: Partial<Profile['newsletter']>) => setProfile({ newsletter: { ...newsletter, ...patch } })
  const hint = newsletterHint(newsletter.url)
  return (
    <div className="flex flex-col">
      <InputGroup size="compact" className="w-full gap-1">
        <UrlField
          field="newsletterUrl"
          label="Link"
          placeholder="buttondown.com/you"
          icon={Mail}
          value={newsletter.url}
          error={errors.newsletterUrl}
          onChange={(url) => set({ url })}
        />
        <InputField
          index={1}
          label="Title"
          className={WELL_FIELD}
          placeholder="Optional: Shipping notes"
          maxLength={40}
          value={newsletter.title}
          onChange={(title) => set({ title })}
        />
        <InputField
          index={2}
          label="Description"
          className={WELL_FIELD}
          placeholder="Optional: one email a month"
          maxLength={90}
          value={newsletter.description}
          onChange={(description) => set({ description })}
        />
      </InputGroup>
      {hint && <Hint>{hint}</Hint>}
    </div>
  )
}

/** Donate: where to send support, and the button's words. */
export function DonateFields() {
  const { config, errors } = useEditor()
  const setProfile = useSetProfile()
  const donate = config.click.profile.donate
  const set = (patch: Partial<Profile['donate']>) => setProfile({ donate: { ...donate, ...patch } })
  return (
    <InputGroup size="compact" className="w-full gap-1">
      <UrlField
        field="donateUrl"
        label="Link"
        placeholder="ko-fi.com/you"
        icon={Heart}
        value={donate.url}
        error={errors.donateUrl}
        onChange={(url) => set({ url })}
      />
      <InputField
        index={1}
        label="Button"
        className={WELL_FIELD}
        placeholder="Support my work"
        maxLength={32}
        value={donate.label}
        onChange={(label) => set({ label })}
      />
    </InputGroup>
  )
}
