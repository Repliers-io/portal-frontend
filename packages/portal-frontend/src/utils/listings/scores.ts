import { type ApiListing } from 'services/API'

// `imagesScore` is aligned with `images`, whichever `imagesOrder` the request
// asked for, so the AI match is simply the top-scored photo. Its key, not its
// position, is what the card and the PDP link open on.
export const markMatchedImage = (listing: ApiListing) => {
  const { images = [], imagesScore = [] } = listing
  const top = Math.max(...imagesScore)

  if (top <= 0) return listing

  return { ...listing, matchedImage: images[imagesScore.indexOf(top)] }
}
