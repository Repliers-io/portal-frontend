export const maxDistance = 30 // km
export const activeCountLimit = 2 // minimal active listings count to show city / hood

export const allValues = ['listing', 'listings', 'property', 'properties']
export const condoValues = ['condo', 'condos', 'apartment', 'apartments']
export const residentialValues = [
  'home',
  'homes',
  'house',
  'houses',
  'residential'
]
export const priceFilterPrefixes = ['below-', 'above-', 'under-']
export const compoundPrefixes = ['below', 'above', 'under', 'for', 'sort']

// NOTE: no 'new' here — real city slugs start with it ('newmarket', 'new-toronto',
// 'new-tecumseth'); the closed set of 'new-*' filter segments lives in exactFilters.
export const typePrefixes = ['luxury', 'premium', 'open', 'sold']

export const typeValues = [
  'land',
  'semi',
  'townhome',
  'townhomes',
  'detached',
  'business',
  'commercial',
  'penthouses',
  'lofts',
  'construction'
]

export const filterPrefixes = [
  'for-',
  'sort-',
  ...typePrefixes,
  ...allValues,
  ...typeValues,
  ...condoValues,
  ...residentialValues,
  ...priceFilterPrefixes
]

export const filterSuffixes = [
  'bed',
  'beds',
  'bedroom',
  'bedrooms',
  'bath',
  'baths',
  'bathroom',
  'bathrooms',
  'garage',
  'garages',
  'parking',
  'parkings'
]

// Segments recognised as filters only on EXACT match. 'new' is too ambiguous for
// prefix/token matching — 'newmarket', 'new-toronto', 'new-tecumseth' are real
// city slugs — so its filter forms are enumerated here as a closed set.
export const exactFilters = ['new', 'new-listings', 'new-construction']
