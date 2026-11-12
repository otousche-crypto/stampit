import { useEffect, useState, type ComponentType } from 'react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { CHANNELS, domainMatches, isValidUrl, normalizeUrl } from '@/badge/channels'
import { SOCIALS, type SocialNetwork } from '@/badge/schema'
import type { IconComponentProps } from '@/lib/icon-context'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FieldLabel, Hint } from './controls'
import { useEditor } from './EditorProvider'

/** Network logos as icon components for the fields' leading slot. */
const LOGOS = Object.fromEntries(
  SOCIALS.map((network) => {
    const Logo: ComponentType<IconComponentProps> = ({ size = 16, className }) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
        <path d={CHANNELS[network].icon.d} />
      </svg>
    )
    return [network, Logo]
  }),
) as Record<SocialNetwork, ComponentType<IconComponentProps>>

/**
 * One field per network. Each filled address adds a round logo link to the
 * right of the badge, or to the profile modal in Profile mode.
 */
/** `collapsible`: folded in an accordion (the badge settings) or always open (the profile editor). */
export function SocialLinks({ collapsible = true }: { collapsible?: boolean }) {
  const { config, update, errors, errorsShown, revealKey } = useEditor()
  const [touched, setTouched] = useState<Partial<Record<SocialNetwork, boolean>>>({})
  const [open, setOpen] = useState('')
  // A copy attempt with a broken social link unfolds the list to show it.
  useEffect(() => {
    if (revealKey && Object.keys(errors.social).length) setOpen('socials')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey])
  const set = (network: SocialNetwork, url: string) =>
    update((c) => ({ ...c, socials: { ...c.socials, [network]: url } }))

  const filled = SOCIALS.filter((n) => config.socials[n].trim()).length

  const fields = (
    <InputGroup size="compact" className="w-full gap-1.5">
      {SOCIALS.map((network, index) => {
        const def = CHANNELS[network]
        const url = config.socials[network]
        const mismatch = isValidUrl(url) && !domainMatches(url, network)
        return (
          <div
            key={network}
            data-field={`social-${network}`}
            onBlur={() => {
              setTouched((t) => ({ ...t, [network]: true }))
              const normalized = normalizeUrl(url)
              if (normalized !== url) set(network, normalized)
            }}
          >
            <InputField
              index={index}
              label={def.label}
              labelHidden
              icon={LOGOS[network]}
              type="url"
              inputMode="url"
              placeholder={def.placeholder}
              value={url}
              error={touched[network] || errorsShown ? errors.social[network] : undefined}
              onChange={(v) => set(network, v)}
            />
            {mismatch && <Hint>{`This doesn't look like a ${def.label} link.`}</Hint>}
          </div>
        )
      })}
    </InputGroup>
  )

  if (!collapsible) {
    return (
      <div className="flex flex-col">
        <FieldLabel>Social links</FieldLabel>
        {fields}
      </div>
    )
  }

  return (
    // Folded by default: optional, and five fields would crowd the panel.
    <Accordion type="single" collapsible size="compact" className="w-auto" value={open} onValueChange={setOpen}>
      <AccordionItem value="socials" highlight="trigger">
        <AccordionTrigger>{filled ? `Social links · ${filled}` : 'Social links'}</AccordionTrigger>
        <AccordionContent>{fields}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
