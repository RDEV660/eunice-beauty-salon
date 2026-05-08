/**
 * Salon gallery — one entry per file in `public/gallery/`.
 * To add photos: drop a new PNG/WebP here and append `{ file: 'gallery-08.png' }`.
 * To remove one: delete its row (and the file from `public/gallery/` if unused).
 */
export type GalleryItem = { file: string }

export const GALLERY_ITEMS: readonly GalleryItem[] = [
  { file: 'gallery-01.png' },
  { file: 'gallery-02.png' },
  { file: 'gallery-03.png' },
  { file: 'gallery-04.png' },
  { file: 'gallery-05.png' },
  /* gallery-06 removed per owner request */
  { file: 'gallery-07.png' },
] as const

export function gallerySrc(item: GalleryItem): string {
  return `/gallery/${item.file}`
}

/** How many thumbnails to show on the home teaser strip */
export const GALLERY_TEASER_COUNT = 3
