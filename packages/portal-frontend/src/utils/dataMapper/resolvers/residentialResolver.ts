import { type ApiListing } from 'services/API'

import {
  appliancesResolver,
  exteriorResolver,
  featuresResolver,
  homeResolver,
  neighborhoodResolver,
  roomsResolver
} from './residential'

export const residentialResolver = (listing: ApiListing) => {
  return {
    homeDetails: homeResolver(listing),
    features: featuresResolver(listing),
    appliances: appliancesResolver(listing),
    neighborhood: neighborhoodResolver(listing),
    exterior: exteriorResolver(listing),
    condominium: [],
    rooms: roomsResolver(listing)
  }
}
