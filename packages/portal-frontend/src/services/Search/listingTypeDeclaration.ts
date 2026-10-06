import filtersConfig from '@configs/filters'
import type { ListingType, ListingTypeDeclaration } from '@defaults/filters'

const config = filtersConfig.listingTypeDeclaration

const propertyTypesUnion = (declaration: ListingTypeDeclaration): string[] => [
  ...new Set(
    Object.values(declaration).flatMap(
      (group) => (group?.propertyType as string[]) ?? []
    )
  )
]

// Only the types this tenant actually renders (`listingTypes`, minus the derived
// `allListings`). Drops base types a tenant inherits from the default declaration
// but never surfaces (e.g. URBN never shows business / commercial / semiDetached).
const rendered = (filtersConfig.listingTypes as readonly ListingType[]).filter(
  (type) => type !== 'allListings'
)
const picked: ListingTypeDeclaration = Object.fromEntries(
  rendered.map((type) => [type, config[type]]).filter(([, entry]) => entry)
)

// `penthouse` / `loft` are never buttons but stay reachable via the `/penthouses`
// and `/lofts` location aliases; derive them from `condo` + the search shortcut.
const condoBase = picked.condo && {
  class: picked.condo.class,
  propertyType: picked.condo.propertyType
}

// The runtime listing-type declaration: the tenant's rendered types, the derived
// search shortcuts, and `allListings` (union of every rendered propertyType under
// the fixed residential/condo class). `transformers` and `adapter` read this.
export const listingTypeDeclaration: ListingTypeDeclaration = {
  ...picked,
  ...(condoBase && {
    penthouse: { ...condoBase, search: 'penthouse' },
    loft: { ...condoBase, search: 'loft' }
  }),
  allListings: {
    class: ['residential', 'condo'],
    propertyType: propertyTypesUnion(picked)
  }
}
