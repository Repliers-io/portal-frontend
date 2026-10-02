// Ids shared by the parcels overlay config and the parcel-listings hooks. This
// module imports NOTHING on purpose: `utils/map/overlays.ts` imports `@configs/map`,
// `defaults/map.ts` imports `overlays/parcels.ts`, and the overlay reads these at
// module-init time. Putting them there would close that cycle on a value that may
// not be initialised yet. (`overlays/liveBy.ts` survives the same cycle only because
// it reads `fetchLocations` lazily, inside an arrow function.)
export const parcelsOverlayId = 'parcels'
export const parcelMatchedSourceId = 'parcel-listings'
export const parcelMatchedFillId = 'parcel-listings-fill'
export const parcelMatchedLineId = 'parcel-listings-outline'
