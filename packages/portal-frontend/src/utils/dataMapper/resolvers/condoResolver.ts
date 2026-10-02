import { type ApiListing } from 'services/API'

import {
  condominiumResolver,
  exteriorResolver,
  featuresResolver,
  homeResolver
} from './condo'
import {
  appliancesResolver,
  neighborhoodResolver,
  roomsResolver
} from './residential'

export const condoResolver = (listing: ApiListing) => {
  return {
    homeDetails: homeResolver(listing),
    features: featuresResolver(listing),
    appliances: appliancesResolver(listing),
    neighborhood: neighborhoodResolver(listing),
    exterior: exteriorResolver(listing),
    condominium: condominiumResolver(listing),
    rooms: roomsResolver(listing)
  }
}
