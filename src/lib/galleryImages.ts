/**
 * Salon gallery — files in `public/gallery/gallery-01.png` … `gallery-NN.png`.
 *
 * To change how many images ship: update `GALLERY_IMAGE_COUNT` and add/remove
 * files to match (always zero-padded two-digit names).
 */
export type GalleryItem = { file: string }

/** First N thumbnails use per-photo `gallery.slides.s1` … keys; the rest use `gallery.slideAltExtra`. */
export const GALLERY_DETAILED_ALT_COUNT = 6

export const GALLERY_IMAGE_COUNT = 30

export const GALLERY_ITEMS: readonly GalleryItem[] = Array.from({ length: GALLERY_IMAGE_COUNT }, (_, i) => {
  const n = i + 1
  const pad = n < 10 ? `0${n}` : String(n)
  return { file: `gallery-${pad}.png` }
})

export function gallerySrc(item: GalleryItem): string {
  return `/gallery/${item.file}`
}

/** How many thumbnails to show on the home teaser strip */
export const GALLERY_TEASER_COUNT = 3
