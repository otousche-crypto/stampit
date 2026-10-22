import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEditor } from './EditorProvider'

export function ResetButton() {
  const { reset } = useEditor()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="ghost" size="compact" onClick={() => setOpen(true)}>
        Reset
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Start over?</DialogTitle>
            <DialogDescription>Your badge goes back to the default settings. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                reset()
                setOpen(false)
                // Back to the first field (§6.2).
                requestAnimationFrame(() =>
                  document.querySelector<HTMLInputElement>('input[placeholder="Your Name"]')?.focus(),
                )
              }}
            >
              Reset badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
