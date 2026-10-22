import { describe, expect, it } from 'vitest'
import { generatePrompt, UPLOAD_PUBLIC_PATH } from './generatePrompt'
import { FIXTURES } from './fixtures'
import { mergeDeep } from '../schema'

describe('generatePrompt', () => {
  for (const [name, config] of Object.entries(FIXTURES)) {
    it(`snapshot: ${name}`, () => {
      expect(generatePrompt(config, { editUrl: 'https://stampit.example/create#c=abc' })).toMatchSnapshot()
    })
  }

  it('has the seven sections', () => {
    const prompt = generatePrompt(FIXTURES['bubbles-2'])
    for (const title of ['Goal', 'Visual spec', 'Behavior', 'Accessibility', 'Reference implementation', 'Acceptance criteria']) {
      expect(prompt).toContain(`## ${title}`)
    }
    expect(prompt).not.toContain('## Avatar')
  })

  it('replaces an uploaded photo by a file path', () => {
    const config = mergeDeep(FIXTURES['link-initials'], { avatar: { source: 'upload' } })
    const prompt = generatePrompt(config)
    expect(prompt).toContain('## Avatar')
    expect(prompt).toContain(`src="${UPLOAD_PUBLIC_PATH}"`)
    expect(prompt).not.toContain('data:image')
  })
})
