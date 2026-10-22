import { TabsSubtle, TabsSubtleItem } from '@/components/ui/tabs-subtle'
import { Elevated } from '@/lib/elevated'
import { setAppearance, useAppearance } from './appearance'

/** Sticky Light / Dark switch, top centre, on every page. */
export function AppearanceSwitch() {
  const appearance = useAppearance()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center">
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
    </div>
  )
}
