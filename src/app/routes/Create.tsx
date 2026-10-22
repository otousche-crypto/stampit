import { useMemo } from 'react'
import { createDefaultConfig } from '@/badge/schema'
import { EditorProvider } from '@/editor/EditorProvider'
import { EditorLayout } from '@/editor/EditorLayout'

export function Create() {
  const initial = useMemo(() => createDefaultConfig(), [])
  return (
    <EditorProvider initialConfig={initial}>
      <EditorLayout />
    </EditorProvider>
  )
}
