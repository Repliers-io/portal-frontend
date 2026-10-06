import { type ApiListing } from 'services/API'

import { markMatchedImage } from './scores'

const listingWith = (images: string[], imagesScore?: number[]) =>
  ({ images, ...(imagesScore ? { imagesScore } : {}) }) as ApiListing

// REBNY keys: the digits after `_` are an id, not a position, and ordinal keys
// can sit among them in the same listing.
const images = [
  'rebnymls/IMG-RLS20086939_170327006215316541211.jpg',
  'rebnymls/IMG-RLS20086939_2.jpg',
  'rebnymls/IMG-RLS20086939_170320073342658792217.jpg'
]

describe('markMatchedImage', () => {
  it('names the top-scored photo and keeps the API order', () => {
    const result = markMatchedImage(listingWith(images, [0, 0.8, 0.9]))

    expect(result.matchedImage).toBe(images[2])
    expect(result.images).toBe(images)
  })

  it('leaves a listing without a positive score as is', () => {
    const plain = listingWith(images)
    const unmatched = listingWith(images, [0, 0, 0])

    expect(markMatchedImage(plain)).toBe(plain)
    expect(markMatchedImage(unmatched)).toBe(unmatched)
  })
})
