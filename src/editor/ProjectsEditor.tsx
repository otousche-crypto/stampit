import { useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import { MAX_PROJECTS, newProjectId, type Project } from '@/badge/schema'
import { FieldLabel, WELL_FIELD } from './controls'
import { useEditor } from './EditorProvider'

type RowProps = {
  project: Project
  index: number
  error?: string
  shown: boolean
  onChange: (patch: Partial<Project>) => void
  onRemove: () => void
}

function ProjectRow({ project, index, error, shown, onChange, onRemove }: RowProps) {
  const [touched, setTouched] = useState(false)
  const name = project.name.trim() || `Project ${index + 1}`
  return (
    <li className="flex items-start gap-1">
      <div
        className="min-w-0 flex-1"
        data-field={`project-${project.id}`}
        onBlur={() => {
          setTouched(true)
          const normalized = normalizeUrl(project.url)
          if (normalized !== project.url) onChange({ url: normalized })
        }}
      >
        <InputGroup size="compact" className="w-full gap-1">
          <InputField
            index={0}
            label="Name"
            className={WELL_FIELD}
            placeholder="Stampit"
            maxLength={40}
            value={project.name}
            error={touched || shown ? error : undefined}
            onChange={(value) => onChange({ name: value })}
          />
          <InputField
            index={1}
            label="URL"
            className={WELL_FIELD}
            type="url"
            inputMode="url"
            placeholder="stampit.app"
            value={project.url}
            onChange={(url) => onChange({ url })}
          />
          <InputField
            index={2}
            label="Description"
            className={WELL_FIELD}
            placeholder="Signature badges for side projects"
            maxLength={90}
            value={project.description}
            onChange={(description) => onChange({ description })}
          />
        </InputGroup>
      </div>
      <Button variant="ghost" size="icon-compact" aria-label={`Remove ${name}`} onClick={onRemove} className="mt-[20px] shrink-0">
        <Trash2 size={14} />
      </Button>
    </li>
  )
}

/** Profile mode: the projects listed in the modal, entered by hand. */
export function ProjectsEditor() {
  const { config, update, errors, errorsShown } = useEditor()
  const projects = config.click.profile.projects
  const listRef = useRef<HTMLUListElement>(null)
  const full = projects.length >= MAX_PROJECTS

  const setProjects = (next: Project[]) =>
    update((c) => ({ ...c, click: { ...c.click, profile: { ...c.click.profile, projects: next } } }))

  const add = () => {
    if (full) return
    setProjects([...projects, { id: newProjectId(), name: '', url: '', description: '' }])
    // Focus the new row's name.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLInputElement>('li:last-child input')?.focus())
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Projects</FieldLabel>
      {projects.length > 0 && (
        <ul ref={listRef} className="flex flex-col gap-3" aria-label="Projects">
          {projects.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              error={errors.project[project.id]}
              shown={errorsShown}
              onChange={(patch) => setProjects(projects.map((p) => (p.id === project.id ? { ...p, ...patch } : p)))}
              onRemove={() => setProjects(projects.filter((p) => p.id !== project.id))}
            />
          ))}
        </ul>
      )}
      <Button variant="secondary" size="compact" leadingIcon={Plus} disabled={full} onClick={add} className="self-start">
        {full ? `Up to ${MAX_PROJECTS} projects` : 'Add project'}
      </Button>
    </div>
  )
}
