/**
 * The avatars a badge can use: 3D portraits from Fluent Emoji (Microsoft,
 * MIT), served from `public/avatars/`. No photo upload: the badge shows
 * one of these, or initials.
 */
export const AVATARS = [
  { id: 'amelie', name: 'Amélie' },
  { id: 'camille', name: 'Camille' },
  { id: 'clara', name: 'Clara' },
  { id: 'daniel', name: 'Daniel' },
  { id: 'hannah', name: 'Hannah' },
  { id: 'jonas', name: 'Jonas' },
  { id: 'lucas', name: 'Lucas' },
  { id: 'mateo', name: 'Mateo' },
  { id: 'olivier', name: 'Olivier' },
  { id: 'sofia', name: 'Sofia' },
  { id: 'yuki', name: 'Yuki' },
].map((a) => ({ ...a, src: `/avatars/${a.id}.png` }))

/** Behind the transparent 3D avatars: a soft neutral that reads in light and dark. */
export const AVATAR_BACKGROUND = '#E9E9EE'
