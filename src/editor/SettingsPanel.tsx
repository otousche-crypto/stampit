import { useState, type ReactNode } from 'react'
import { Banner, BannerTitle } from '@/components/ui/banner'
import { useEditor } from './EditorProvider'
import { PresetSection } from './sections/PresetSection'
import { TextSection } from './sections/TextSection'
import { AvatarSection } from './sections/AvatarSection'
import { ColorsSection } from './sections/ColorsSection'
import { ShapeSection } from './sections/ShapeSection'
import { ClickSection } from './sections/ClickSection'
import { AnimationSection } from './sections/AnimationSection'

const NOTICES = {
  'invalid-link': "This link couldn't be read. We loaded a fresh badge.",
  'missing-photo': "Your photo isn't stored in this link. Upload it again or use an image URL.",
} as const

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

/** A group of settings, separated from the next by a hairline. No title: every option is in view. */
function Group({ children }: { children: ReactNode }) {
  return <div className="flex flex-col border-b border-border px-2 py-3 last:border-b-0">{children}</div>
}

export function SettingsPanel({ autoFocus: allowAutoFocus = true }: { autoFocus?: boolean }) {
  const [autoFocus] = useState(() => allowAutoFocus && isDesktop())
  const { notice, dismissNotice } = useEditor()

  return (
    <div className="flex flex-col pb-24 lg:pb-3">
      {notice && (
        <div className="px-3 pt-3">
          <Banner status={notice === 'invalid-link' ? 'error' : 'warning'} size="compact" dismissible onDismiss={dismissNotice}>
            <BannerTitle>{NOTICES[notice]}</BannerTitle>
          </Banner>
        </div>
      )}
      <Group>
        <AvatarSection />
        <TextSection autoFocusBold={autoFocus} />
      </Group>
      <Group>
        <PresetSection />
        <ColorsSection />
      </Group>
      <Group>
        <ShapeSection />
      </Group>
      <Group>
        <AnimationSection />
      </Group>
      <Group>
        <ClickSection />
      </Group>
    </div>
  )
}
