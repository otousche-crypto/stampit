import { useEffect, useRef, useState } from 'react'
import { AtSign, ImageUp, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { Banner, BannerTitle } from '@/components/ui/banner'
import { deriveInitials } from '@/badge/export/generateHtml'
import { normalizeUrl } from '@/badge/channels'
import type { BadgeConfig } from '@/badge/schema'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { AvatarCropDialog } from '../AvatarCropDialog'
import { Choice, ColorField, Hint } from '../controls'
import { useEditor } from '../EditorProvider'

type Avatar = BadgeConfig['avatar']

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

export function AvatarSection() {
  const { config, update, uploadDataUrl, setUploadDataUrl, avatarFailed, setAvatarFailed } = useEditor()
  const avatar = config.avatar
  const set = (patch: Partial<Avatar>) => update((c) => ({ ...c, avatar: { ...c.avatar, ...patch } }))

  const fileRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [github, setGithub] = useState<string | null>(null)

  // Watch the image URL: a broken one falls back to initials (§6.3).
  const imageUrl = avatar.source === 'url' ? avatar.url : null
  useEffect(() => {
    setAvatarFailed(false)
    if (!imageUrl) return
    let cancelled = false
    const img = new Image()
    img.onload = () => !cancelled && setAvatarFailed(false)
    img.onerror = () => !cancelled && setAvatarFailed(true)
    img.src = imageUrl
    return () => {
      cancelled = true
    }
  }, [imageUrl, setAvatarFailed])

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

  const showBackground = avatar.source === 'initials' || avatar.source === 'url' || avatar.source === 'upload'

  return (
    <div className="flex flex-col gap-4">
      <Choice
        label="Source"
        value={avatar.source}
        onChange={(source) => set({ source })}
        options={[
          { value: 'none', label: 'None' },
          { value: 'initials', label: 'Initials' },
          { value: 'upload', label: 'Upload' },
          { value: 'url', label: 'URL' },
        ]}
      />

      {avatar.source === 'initials' && (
        <InputGroup size="compact" className="w-full">
          <InputField
            index={0}
            label="Initials"
            placeholder={deriveInitials({ ...config, avatar: { ...avatar, initials: null } })}
            value={avatar.initials ?? ''}
            maxLength={2}
            onChange={(v) => set({ initials: v.trim() ? v.slice(0, 2) : null })}
          />
        </InputGroup>
      )}

      {avatar.source === 'upload' && (
        <div className="flex flex-col gap-1">
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
          <div className="flex items-center gap-2 px-1">
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
          {fileError ? (
            <Hint id="avatar-file-error" tone="error">
              {fileError}
            </Hint>
          ) : (
            <Hint id="avatar-file-hint">PNG, JPG or WebP, up to 10 MB.</Hint>
          )}
          <AvatarCropDialog
            src={cropSrc}
            onCancel={closeCrop}
            onDone={(dataUrl) => {
              setUploadDataUrl(dataUrl)
              closeCrop()
            }}
          />
        </div>
      )}

      {avatar.source === 'url' && (
        <div className="flex flex-col gap-1">
          <InputGroup size="compact" className="w-full gap-2">
            <div
              onBlur={() => {
                const raw = avatar.url ?? ''
                // Site-relative paths ("/me.png") are fine for an image.
                const normalized = raw.startsWith('/') ? raw : normalizeUrl(raw)
                if (normalized !== raw) set({ url: normalized || null })
              }}
            >
              <InputField
                index={0}
                label="Image URL"
                type="url"
                inputMode="url"
                icon={Link2}
                placeholder="example.com/me.png"
                value={avatar.url ?? ''}
                onChange={(v) => set({ url: v || null })}
              />
            </div>
            {github !== null && (
              <InputField
                index={1}
                label="GitHub username"
                icon={AtSign}
                placeholder="octocat"
                value={github}
                autoFocus
                onChange={(v) => {
                  const user = v.replace(/^@/, '').trim()
                  setGithub(v)
                  set({ url: user ? `https://github.com/${encodeURIComponent(user)}.png` : null })
                }}
              />
            )}
          </InputGroup>
          {github === null && (
            <button
              type="button"
              onClick={() => setGithub('')}
              className={cn(
                'self-start rounded px-2 py-1 text-muted-foreground underline underline-offset-2 hover:text-foreground outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)] cursor-pointer',
                typeClass('caption'),
              )}
            >
              Use GitHub username
            </button>
          )}
          {avatarFailed && (
            <Banner status="warning" size="compact">
              <BannerTitle>We couldn't load this image.</BannerTitle>
            </Banner>
          )}
        </div>
      )}

      {showBackground && (
        <ColorField label="Background" value={avatar.background} onChange={(background) => set({ background })} />
      )}
    </div>
  )
}
