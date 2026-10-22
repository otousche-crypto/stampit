import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'

/** §6.3 — output of the crop: WebP, 96 × 96, quality 0.75. */
export const AVATAR_OUTPUT_SIZE = 96
export const AVATAR_OUTPUT_QUALITY = 0.75

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function cropToWebp(src: string, area: Area): Promise<string> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_OUTPUT_SIZE
  canvas.height = AVATAR_OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE)
  return canvas.toDataURL('image/webp', AVATAR_OUTPUT_QUALITY)
}

type AvatarCropDialogProps = {
  /** Object URL of the picked file; null closes the dialog. */
  src: string | null
  onCancel: () => void
  onDone: (dataUrl: string) => void
}

export function AvatarCropDialog({ src, onCancel, onDone }: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), [])

  const save = async () => {
    if (!src || !area) return
    setBusy(true)
    try {
      onDone(await cropToWebp(src, area))
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={src !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
          <DialogDescription>Drag to move. Use the slider, or scroll, to zoom.</DialogDescription>
        </DialogHeader>
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              minZoom={1}
              maxZoom={3}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <Slider
          size="compact"
          label="Zoom"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          formatValue={(v) => `${v.toFixed(1)}×`}
          onChange={(v) => setZoom(v as number)}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={busy} disabled={!area}>
            Use photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
