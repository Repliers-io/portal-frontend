// A restricted listing is always shown blurred over a generic photo — never its
// real images, which must not leak even blurred (map/cluster listings arrive
// with real image URLs). Non-restricted galleries keep their own images.
export const resolveGalleryImages = (
  images: string[],
  blurred: boolean,
  fallback: string
): string[] => (blurred ? [fallback] : images)
