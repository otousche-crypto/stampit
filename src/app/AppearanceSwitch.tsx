import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'
import { Elevated } from '@/lib/elevated'
import { setAppearance, useAppearance } from './appearance'

/** Light / Dark switch for the whole site (sits in the fixed header). */
export function AppearanceSwitch() {
  const appearance = useAppearance()
  return (
    <Elevated offset={2} className="pointer-events-auto rounded-xl p-1">
      <TabsSubtle
        aria-label="Appearance"
        size="compact"
        selectedIndex={appearance === 'dark' ? 1 : 0}
        onSelect={(i) => setAppearance(i === 0 ? 'light' : 'dark')}
      >
        <TabsSubtleItem index={0} label="Light" />
        <TabsSubtleItem index={1} label="Dark" />
      </TabsSubtle>
    </Elevated>
  )
}
