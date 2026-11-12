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
