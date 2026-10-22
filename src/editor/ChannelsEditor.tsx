import { useRef, useState, type KeyboardEvent } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Banner, BannerAction, BannerActions, BannerTitle } from '@/components/ui/banner'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { InputField, InputGroup } from '@/components/ui/input-group'
import {
  CHANNELS,
  CHANNEL_ORDER,
  MAX_CHANNELS,
  channelLabel,
  domainMatches,
  isValidUrl,
  normalizeUrl,
} from '@/badge/channels'
import { newChannelId, type Channel, type ChannelType } from '@/badge/schema'
import { spring } from '@/lib/springs'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { FieldLabel, Hint, Suggestions } from './controls'
import { useEditor } from './EditorProvider'

function ChannelGlyph({ type }: { type: ChannelType }) {
  const icon = CHANNELS[type].icon
  return icon.kind === 'fill' ? (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d={icon.d} />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icon.d} />
    </svg>
  )
}

type RowProps = {
  channel: Channel
  index: number
  count: number
  error?: string
  onChange: (patch: Partial<Channel>) => void
  onRemove: () => void
  onMove: (delta: -1 | 1) => void
}

function ChannelRow({ channel, index, count, error, onChange, onRemove, onMove }: RowProps) {
  const controls = useDragControls()
  const [touched, setTouched] = useState(false)
  const def = CHANNELS[channel.type]
  const name = channelLabel(channel)
  const isEmail = channel.type === 'email'
  const shownUrl = isEmail ? channel.url.replace(/^mailto:/i, '') : channel.url
  const mismatch =
    channel.url && isValidUrl(channel.url, channel.type) && !domainMatches(channel.url, channel.type)

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!e.altKey) return
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      onMove(-1)
    } else if (e.key === 'ArrowDown' && index < count - 1) {
      e.preventDefault()
      onMove(1)
    }
  }

  return (
    <Reorder.Item
      value={channel}
      dragListener={false}
      dragControls={controls}
      transition={spring.moderate}
      className="relative rounded-lg bg-background"
      as="li"
    >
      <div className="flex items-start gap-1 py-1">
        <button
          type="button"
          aria-label={`Move ${name}. Use Alt + arrow keys to reorder.`}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={onHandleKey}
          className="mt-[22px] flex h-7 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)] active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        <span className="mt-[28px] flex shrink-0 text-muted-foreground">
          <ChannelGlyph type={channel.type} />
        </span>
        <div
          className="min-w-0 flex-1"
          onBlur={() => {
            setTouched(true)
            const normalized = normalizeUrl(channel.url, channel.type)
            if (normalized !== channel.url) onChange({ url: normalized })
          }}
        >
          <InputGroup size="compact" className="w-full gap-1">
            {channel.type === 'custom' && (
              <InputField
                index={0}
                label="Label"
                placeholder="Portfolio"
                maxLength={20}
                value={channel.label ?? ''}
                onChange={(label) => onChange({ label })}
              />
            )}
            <InputField
              index={channel.type === 'custom' ? 1 : 0}
              label={isEmail ? 'Email' : def.label}
              type={isEmail ? 'email' : 'url'}
              inputMode={isEmail ? 'email' : 'url'}
              placeholder={def.placeholder}
              value={shownUrl}
              error={touched ? error : undefined}
              onChange={(v) => onChange({ url: isEmail && v ? `mailto:${v.replace(/^mailto:/i, '')}` : v })}
            />
          </InputGroup>
          {mismatch && <Hint>{`This doesn't look like a ${def.label} link.`}</Hint>}
        </div>
        <Button
          variant="ghost"
          size="icon-compact"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className="mt-[20px] shrink-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Reorder.Item>
  )
}

export function ChannelsEditor() {
  const { config, update, errors } = useEditor()
  const channels = config.click.bubbles.channels
  const [pick, setPick] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  const setChannels = (next: Channel[]) =>
    update((c) => ({ ...c, click: { ...c.click, bubbles: { ...c.click.bubbles, channels: next } } }))

  const used = new Set(channels.map((ch) => ch.type))
  const available = CHANNEL_ORDER.filter((t) => t === 'custom' || !used.has(t)).map((t) => ({
    value: t,
    label: CHANNELS[t].label,
  }))
  const full = channels.length >= MAX_CHANNELS

  const add = (type: ChannelType) => {
    if (full || (type !== 'custom' && used.has(type))) return
    const channel: Channel = { id: newChannelId(), type, url: '' }
    if (type === 'custom') channel.label = ''
    setChannels([...channels, channel])
    // Focus the new row's address field.
    requestAnimationFrame(() => {
      const inputs = listRef.current?.querySelectorAll('li:last-child input')
      ;(inputs?.[inputs.length - 1] as HTMLInputElement | undefined)?.focus()
    })
  }

  const move = (index: number, delta: -1 | 1) => {
    const next = [...channels]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    setChannels(next)
    // Keep focus on the moved handle.
    requestAnimationFrame(() => {
      const handles = listRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-keyshortcuts]')
      handles?.[index + delta]?.focus()
    })
  }

  const suggestions = (['website', 'x'] as const).filter((t) => !used.has(t))

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Channels</FieldLabel>
      {channels.length > 0 && (
        <Reorder.Group
          ref={listRef}
          axis="y"
          values={channels}
          onReorder={setChannels}
          className="flex flex-col"
          aria-label="Channels"
        >
          {channels.map((channel, index) => (
            <ChannelRow
              key={channel.id}
              channel={channel}
              index={index}
              count={channels.length}
              error={errors.channel[channel.id]}
              onChange={(patch) => setChannels(channels.map((c) => (c.id === channel.id ? { ...c, ...patch } : c)))}
              onRemove={() => setChannels(channels.filter((c) => c.id !== channel.id))}
              onMove={(delta) => move(index, delta)}
            />
          ))}
        </Reorder.Group>
      )}
      {channels.length < 2 && suggestions.length > 0 && (
        <Suggestions
          label="Suggested channels"
          items={suggestions.map((t) => `+ ${CHANNELS[t].label}`)}
          onPick={(label) => {
            const type = suggestions.find((t) => `+ ${CHANNELS[t].label}` === label)
            if (type) add(type)
          }}
        />
      )}
      {channels.length === 1 && (
        <Banner status="info" size="compact">
          <BannerTitle>Only one link? Switch to Link mode.</BannerTitle>
          <BannerActions>
            <BannerAction
              variant="secondary"
              onClick={() =>
                update((c) => ({
                  ...c,
                  click: {
                    ...c.click,
                    mode: 'link',
                    link: { ...c.click.link, url: c.click.bubbles.channels[0]?.url || c.click.link.url },
                  },
                }))
              }
            >
              Switch to Link
            </BannerAction>
          </BannerActions>
        </Banner>
      )}
      <div className="flex flex-col gap-1">
        <Combobox
          items={available}
          value={pick}
          size="compact"
          disabled={full}
          onValueChange={(v) => {
            const type = (Array.isArray(v) ? v[0] : v) as ChannelType | ''
            if (type) add(type)
            setPick('')
          }}
        >
          <ComboboxInput
            icon={Plus}
            placeholder={full ? 'Up to 8 channels' : 'Add channel'}
            aria-label="Add channel"
          />
          <ComboboxContent>
            <ComboboxEmpty>No channel found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const it = item as { value: ChannelType; label: string }
                return (
                  <ComboboxItem key={it.value} value={it.value}>
                    <span className="flex items-center gap-2">
                      <ChannelGlyph type={it.value} />
                      {it.label}
                    </span>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {full && <p className={cn('px-2 text-muted-foreground', typeClass('caption'))}>You've reached 8 channels.</p>}
      </div>
    </div>
  )
}
