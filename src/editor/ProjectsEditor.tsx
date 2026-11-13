import { useRef, useState, type KeyboardEvent } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { normalizeUrl } from '@/badge/channels'
import { MAX_PROJECTS, newProjectId, type Project } from '@/badge/schema'
import { spring } from '@/lib/springs'
import { fontWeights } from '@/lib/font-weight'
import { typeClass } from '@/lib/type-scale'
import { cn } from '@/lib/utils'
import { FieldLabel, WELL_FIELD } from './controls'
import { useEditor } from './EditorProvider'

type CardProps = {
  project: Project
  index: number
  count: number
  error?: { field: 'name' | 'url'; message: string }
  shown: boolean
  onChange: (patch: Partial<Project>) => void
  onRemove: () => void
  onMove: (delta: -1 | 1) => void
}

/** One project: a card with its number and name on top, its three fields below. Dragged by the grip. */
function ProjectCard({ project, index, count, error, shown, onChange, onRemove, onMove }: CardProps) {
  const controls = useDragControls()
  const [touched, setTouched] = useState(false)
  const title = project.name.trim()
  const name = title || `Project ${index + 1}`

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!e.altKey) return
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      onMove(-1)
    } else if (e.key === 'ArrowDown' && index < count - 1) {
      e.preventDefault()
      onMove(1)
    }
  }

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={controls}
      transition={spring.moderate}
      as="li"
      aria-label={name}
      className="relative rounded-xl bg-background shadow-[0_0_0_1px_var(--border)]"
    >
      <div className="flex items-center gap-1 py-1 pl-1 pr-1">
        <button
          type="button"
          aria-label={`Move ${name}. Drag, or use Alt + arrow keys.`}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={onHandleKey}
          className="flex h-7 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)] active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        <span
          aria-hidden="true"
          className={cn('flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground tabular-nums', typeClass('caption'))}
        >
          {index + 1}
        </span>
        <span
          className={cn('min-w-0 flex-1 truncate px-1', typeClass('body'), title ? 'text-foreground' : 'text-muted-foreground')}
          style={{ fontVariationSettings: fontWeights.semibold }}
        >
          {name}
        </span>
        <Button variant="ghost" size="icon-compact" aria-label={`Remove ${name}`} onClick={onRemove} className="shrink-0">
          <Trash2 size={14} />
        </Button>
      </div>
      <div
        className="border-t border-border px-1 pb-2 pt-1"
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
            error={(touched || shown) && error?.field === 'name' ? error.message : undefined}
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
            error={(touched || shown) && error?.field === 'url' ? error.message : undefined}
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
    </Reorder.Item>
  )
}

/** Profile mode: the projects listed in the modal, entered by hand, in the order dragged here. */
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
    // Focus the new card's name.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLInputElement>('li:last-child input')?.focus())
  }

  const move = (index: number, delta: -1 | 1) => {
    const next = [...projects]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    setProjects(next)
    // Keep focus on the moved card's grip.
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-keyshortcuts]')[index + delta]?.focus()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Projects</FieldLabel>
      {projects.length > 0 && (
        <Reorder.Group ref={listRef} axis="y" values={projects} onReorder={setProjects} className="flex flex-col gap-2" aria-label="Projects">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              count={projects.length}
              error={errors.project[project.id]}
              shown={errorsShown}
              onChange={(patch) => setProjects(projects.map((p) => (p.id === project.id ? { ...p, ...patch } : p)))}
              onRemove={() => setProjects(projects.filter((p) => p.id !== project.id))}
              onMove={(delta) => move(index, delta)}
            />
          ))}
        </Reorder.Group>
      )}
      <Button variant="secondary" size="compact" leadingIcon={Plus} disabled={full} onClick={add} className="self-start">
        {full ? `Up to ${MAX_PROJECTS} projects` : 'Add project'}
      </Button>
    </div>
  )
}
