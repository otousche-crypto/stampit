import { useRef, useState } from 'react'
import { ImageUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BadgeConfig } from '@/badge/schema'
import { AvatarCropDialog } from '../AvatarCropDialog'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { Hint } from '../controls'
import { useEditor } from '../EditorProvider'

type Avatar = BadgeConfig['avatar']

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

/** Upload a photo. Until one is added, the badge shows initials. */
export function AvatarSection() {
  const { config, update, uploadDataUrl, setUploadDataUrl } = useEditor()
  const avatar = config.avatar
  const set = (patch: Partial<Avatar>) => update((c) => ({ ...c, avatar: { ...c.avatar, ...patch } }))

  const fileRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const pickFile = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setFileError('Use a PNG, JPG or WebP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setFileError('This image is over 10 MB. Try a smaller one.')
      return
    }
    setFileError(null)
    setCropSrc(URL.createObjectURL(file))
  }

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  return (
    <div className="mb-3 flex flex-col gap-1">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          pickFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <div className="flex min-h-9 items-center justify-between gap-2 pl-2">
        <span className={cn('text-muted-foreground', typeClass('body'))}>Avatar</span>
        <div className="flex items-center gap-2">
        {uploadDataUrl && (
          <img src={uploadDataUrl} alt="Your uploaded photo" width={36} height={36} className="size-9 rounded-full object-cover" />
        )}
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={ImageUp}
          aria-describedby={fileError ? 'avatar-file-error' : 'avatar-file-hint'}
          onClick={() => fileRef.current?.click()}
        >
          {uploadDataUrl ? 'Replace photo' : 'Upload photo'}
        </Button>
        </div>
      </div>
      {fileError ? (
        <Hint id="avatar-file-error" tone="error" className="pt-0 text-right">
          {fileError}
        </Hint>
      ) : (
        <Hint id="avatar-file-hint" className="pt-0 text-right">PNG, JPG or WebP, up to 10 MB.</Hint>
      )}
      <AvatarCropDialog
        src={cropSrc}
        onCancel={closeCrop}
        onDone={(dataUrl) => {
          setUploadDataUrl(dataUrl)
          // Older configs may hold initials or a URL: the photo takes over.
          if (avatar.source !== 'upload') set({ source: 'upload' })
          closeCrop()
        }}
      />
    </div>
  )
}
