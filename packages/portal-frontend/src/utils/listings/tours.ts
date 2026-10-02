import { type ApiListingDetails } from 'services/API'
import { scrubbed } from 'utils/formatters'

export type TourMediaType = 'video' | '3d'

export interface TourMedia {
  url: string
  type: TourMediaType
}

// Hosts that serve interactive 3D walkthroughs / dollhouse tours. Everything not
// matched here is treated as a plain video by default. Extend as new 3D
// providers show up in the MLS feed.
const threeDMatchers = [
  'matterport',
  'iguide', // covers iguidephotos.com and youriguide.com
  'kuula',
  'truplace',
  'seehouseat',
  'tourfactory',
  'vrpano',
  'view-imx' // zillow 3D home / pano tours
]

export const classifyTourUrl = (url: string): TourMediaType =>
  threeDMatchers.some((host) => url.toLowerCase().includes(host))
    ? '3d'
    : 'video'

// A listing carries up to two media links (virtualTourUrl + alternateURLVideoLink)
// that may be a 3D tour and a video in either order. Take the first link of each
// type — one 3D card + one video card, with same-type duplicates dropped.
export const getListingTours = (
  details: Pick<ApiListingDetails, 'virtualTourUrl' | 'alternateURLVideoLink'>
): TourMedia[] => {
  const urls = [details.virtualTourUrl, details.alternateURLVideoLink].filter(
    (url) => url && !scrubbed(url)
  )

  return (['3d', 'video'] as const)
    .map((type) => ({
      type,
      url: urls.find((url) => classifyTourUrl(url) === type)
    }))
    .filter((tour): tour is TourMedia => Boolean(tour.url))
}
