/** Public assets in `/public/gallery/gallery-01.png` … `gallery-07.png`. */
export const GALLERY_SLIDE_COUNT = 7

export function galleryImageSrc(indexZeroBased: number): string {
  const n = indexZeroBased + 1
  const pad = n < 10 ? `0${n}` : String(n)
  return `/gallery/gallery-${pad}.png`
}
