/**
 * The avatars a badge can use: 3D portraits from Fluent Emoji (Microsoft,
 * MIT), served from `public/avatars/`. No photo upload: the badge shows
 * one of these, or initials. Ordered so women and men, and every skin tone
 * (yellow, light to dark), alternate along the carousel.
 */
export const AVATARS = [
  { id: 'yuki', name: 'Yuki' },
  { id: 'daniel', name: 'Daniel' },
  { id: 'alex', name: 'Alex' },
  { id: 'lucas', name: 'Lucas' },
  { id: 'aicha', name: 'Aïcha' },
  { id: 'mateo', name: 'Mateo' },
  { id: 'hannah', name: 'Hannah' },
  { id: 'rahul', name: 'Rahul' },
  { id: 'sofia', name: 'Sofia' },
  { id: 'sam', name: 'Sam' },
  { id: 'nadia', name: 'Nadia' },
  { id: 'olivier', name: 'Olivier' },
  { id: 'camille', name: 'Camille' },
  { id: 'kofi', name: 'Kofi' },
  { id: 'amelie', name: 'Amélie' },
  { id: 'jonas', name: 'Jonas' },
  { id: 'clara', name: 'Clara' },
].map((a) => ({ ...a, src: `/avatars/${a.id}.png` }))

/** Behind the transparent 3D avatars: a soft neutral that reads in light and dark. */
export const AVATAR_BACKGROUND = '#E9E9EE'

/** The avatar background swatches (editor "Background"): soft tints that suit the 3D avatars and initials alike. */
export const AVATAR_BACKGROUNDS: { value: string; name: string }[] = [
  { value: AVATAR_BACKGROUND, name: 'Mist' },
  { value: '#FF6B35', name: 'Tangerine' },
  { value: '#FFD166', name: 'Sun' },
  { value: '#8FD9A8', name: 'Mint' },
  { value: '#8EC9F2', name: 'Sky' },
  { value: '#C2A8F5', name: 'Lavender' },
]
