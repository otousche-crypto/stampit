import { describe, expect, it } from 'vitest'
import { generatePrompt } from './generatePrompt'
import { FIXTURES } from './fixtures'
import { mergeDeep } from '../schema'

describe('generatePrompt', () => {
  for (const [name, config] of Object.entries(FIXTURES)) {
    it(`snapshot: ${name}`, () => {
      expect(generatePrompt(config, { editUrl: 'https://stampit.example/create#c=abc' })).toMatchSnapshot()
    })
  }

  it('has the six sections', () => {
    const prompt = generatePrompt(FIXTURES['profile-full'])
    for (const title of ['Goal', 'Visual spec', 'Behavior', 'Accessibility', 'Reference implementation', 'Acceptance criteria']) {
      expect(prompt).toContain(`## ${title}`)
    }
    expect(prompt).not.toContain('## Avatar')
  })

  it('points a built-in avatar at the Stampit site', () => {
    const config = mergeDeep(FIXTURES['link-initials'], { avatar: { source: 'url', url: '/avatars/yuki.png' } })
    const prompt = generatePrompt(config, { assetOrigin: 'https://stampit.example' })
    expect(prompt).toContain('image https://stampit.example/avatars/yuki.png')
    expect(prompt).toContain('src="https://stampit.example/avatars/yuki.png"')
  })
})
