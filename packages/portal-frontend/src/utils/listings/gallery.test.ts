import { resolveGalleryImages } from './gallery'

describe('resolveGalleryImages', () => {
  const fallback = '/house.webp'

  it('returns the fallback when blurred and there are no images', () => {
    expect(resolveGalleryImages([], true, fallback)).toEqual([fallback])
  })

  it('substitutes the generic fallback when blurred, even with images', () => {
    expect(resolveGalleryImages(['a', 'b'], true, fallback)).toEqual([fallback])
  })

  it('does not substitute when not blurred', () => {
    expect(resolveGalleryImages([], false, fallback)).toEqual([])
  })
})
