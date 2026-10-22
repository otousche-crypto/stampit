import { useState } from 'react'
import { AccordionContent, AccordionGroup, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Banner, BannerTitle } from '@/components/ui/banner'
import { useEditor } from './EditorProvider'
import { PresetSection } from './sections/PresetSection'
import { TextSection } from './sections/TextSection'
import { AvatarSection } from './sections/AvatarSection'
import { ColorsSection } from './sections/ColorsSection'
import { ShapeSection } from './sections/ShapeSection'
import { ClickSection } from './sections/ClickSection'

const SECTIONS = [
  { value: 'text', label: 'Text', Component: TextSection },
  { value: 'avatar', label: 'Avatar', Component: AvatarSection },
  { value: 'colors', label: 'Colors', Component: ColorsSection },
  { value: 'shape', label: 'Shape', Component: ShapeSection },
  { value: 'click', label: 'On click', Component: ClickSection },
] as const

const NOTICES = {
  'invalid-link': "This link couldn't be read. We loaded a fresh badge.",
  'missing-photo': "Your photo isn't stored in this link. Upload it again or use an image URL.",
} as const

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

export function SettingsPanel() {
  // All sections open on desktop; only "Text" on smaller screens.
  const [open, setOpen] = useState<string[]>(() => (isDesktop() ? SECTIONS.map((s) => s.value) : ['text']))
  const [autoFocus] = useState(isDesktop)
  const { notice, dismissNotice } = useEditor()

  return (
    <div className="flex flex-col pb-24 lg:pb-6">
      {notice && (
        <div className="px-3 pt-3">
          <Banner status={notice === 'invalid-link' ? 'error' : 'warning'} size="compact" dismissible onDismiss={dismissNotice}>
            <BannerTitle>{NOTICES[notice]}</BannerTitle>
          </Banner>
        </div>
      )}
      <PresetSection />
      <AccordionGroup
        type="multiple"
        size="compact"
        value={open}
        onValueChange={setOpen}
        highlight="trigger"
        className="w-auto px-1"
      >
        {SECTIONS.map(({ value, label, Component }, index) => (
          <AccordionItem key={value} value={value} index={index}>
            <AccordionTrigger>{label}</AccordionTrigger>
            <AccordionContent>
              <div className="px-2 pt-1 pb-4">
                {value === 'text' ? <TextSection autoFocusBold={autoFocus} /> : <Component />}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionGroup>
    </div>
  )
}
