import { Button } from '@/components/ui/button'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { blockingSummary, hasBlockingErrors } from './validation'
import { useEditor } from './EditorProvider'

export function ExportPanel() {
  const { errors } = useEditor()
  const blocked = hasBlockingErrors(errors)
  return (
    <section aria-label="Export" className="flex flex-col gap-2 p-3">
      <Button variant="primary" disabled={blocked} className="w-full">
        Copy prompt
      </Button>
      <Button variant="secondary" disabled={blocked} className="w-full">
        Copy code
      </Button>
      {blocked && <p className={cn('text-muted-foreground', typeClass('caption'))}>{blockingSummary(errors)}</p>}
    </section>
  )
}
