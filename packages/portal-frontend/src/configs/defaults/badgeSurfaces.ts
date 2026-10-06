import { type BadgeSurfaces } from 'utils/listings/badge'

// Status badges shown per card surface. Sold and inactive listings are flagged on
// every card surface; the PDP gallery shows no badge by default. Tenants opt into
// more via override (e.g. badging pending everywhere and on the gallery).
export const badgeSurfaces: BadgeSurfaces = {
  map: ['sold', 'inactive'],
  search: ['sold', 'inactive'],
  carousel: ['sold', 'inactive'],
  locations: ['sold', 'inactive'],
  favorites: ['sold', 'inactive'],
  recent: ['sold', 'inactive'],
  gallery: []
}
