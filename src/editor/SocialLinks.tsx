import { useState, type ComponentType } from 'react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { CHANNELS, domainMatches, isValidUrl, normalizeUrl } from '@/badge/channels'
import { SOCIALS, type SocialNetwork } from '@/badge/schema'
import type { IconComponentProps } from '@/lib/icon-context'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Hint } from './controls'
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
 * right of the badge.
 */
export function SocialLinks() {
  const { config, update, errors } = useEditor()
  const [touched, setTouched] = useState<Partial<Record<SocialNetwork, boolean>>>({})
  const set = (network: SocialNetwork, url: string) =>
    update((c) => ({ ...c, socials: { ...c.socials, [network]: url } }))

  const filled = SOCIALS.filter((n) => config.socials[n].trim()).length

  return (
    // Folded by default: optional, and five fields would crowd the panel.
    <Accordion type="single" collapsible size="compact" className="w-auto">
      <AccordionItem value="socials" highlight="trigger">
        <AccordionTrigger>{filled ? `Social links · ${filled}` : 'Social links'}</AccordionTrigger>
        <AccordionContent>
          <InputGroup size="compact" className="w-full gap-1.5">
            {SOCIALS.map((network, index) => {
              const def = CHANNELS[network]
              const url = config.socials[network]
              const mismatch = isValidUrl(url) && !domainMatches(url, network)
              return (
                <div
                  key={network}
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
                    error={touched[network] ? errors.social[network] : undefined}
                    onChange={(v) => set(network, v)}
                  />
                  {mismatch && <Hint>{`This doesn't look like a ${def.label} link.`}</Hint>}
                </div>
              )
            })}
          </InputGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
