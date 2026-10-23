import { useEffect, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion } from 'motion/react'
import { Code2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exitFallbackMs, spring } from '@/lib/springs'
import { SURFACE_SHADOW, surfaceClasses } from '@/lib/surface-classes'
import { SurfaceProvider, useSurface } from '@/lib/surface-context'
import { typeClass } from '@/lib/type-scale'
import { fontWeights } from '@/lib/font-weight'
import { cn } from '@/lib/utils'
import { ExportPanel } from './ExportPanel'

/**
 * Mobile: a floating "Get code" button opening a bottom sheet with the
 * export column. Composed like Fluid's MobileDrawer (Radix Dialog + Motion,
 * spring.moderate so the sheet lands without overshoot), sliding up instead.
 */
export function ExportSheet() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // The floating button floats like a popover: two steps above its substrate.
  const floatShadow = SURFACE_SHADOW[Math.min(useSurface() + 2, 8)]
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    if (open) return
    const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.moderate))
    return () => clearTimeout(id)
  }, [open])

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center">
        <Button
          ref={triggerRef}
          variant="primary"
          leadingIcon={Code2}
          className={cn('pointer-events-auto', floatShadow)}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          Get code
        </Button>
      </div>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        {mounted && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 dark:bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
                transition={open ? spring.moderate : spring.moderate.exit}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onCloseAutoFocus={(e) => {
                e.preventDefault()
                triggerRef.current?.focus()
              }}
            >
              <motion.div
                className={cn(
                  'fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]',
                  surfaceClasses(6, 3),
                )}
                initial={{ y: '100%' }}
                animate={{ y: open ? 0 : '100%' }}
                transition={open ? spring.moderate : spring.moderate.exit}
                onAnimationComplete={() => {
                  if (!open) setMounted(false)
                }}
              >
                <div className="flex items-center justify-between px-3 pt-3">
                  <DialogPrimitive.Title
                    className={cn('px-1 text-foreground', typeClass('title'))}
                    style={{ fontVariationSettings: fontWeights.semibold }}
                  >
                    Get your badge
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close asChild>
                    <Button variant="ghost" size="icon-compact" aria-label="Close">
                      <X size={16} />
                    </Button>
                  </DialogPrimitive.Close>
                </div>
                <SurfaceProvider value={6}>
                  <ExportPanel className="h-[70dvh]" />
                </SurfaceProvider>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </DialogPrimitive.Root>
    </>
  )
}
