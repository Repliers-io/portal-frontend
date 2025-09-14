export const maxDistance = 30 // km
export const activeCountLimit = 2 // minimal active listings count to show city / hood

export const allValues = ['listing', 'property', 'properties']
export const condoValues = ['condo', 'condos', 'apartment', 'apartments']
export const residentialValues = [
  'home',
  'homes',
  'house',
  'houses',
  'residential'
]
export const priceFilterPrefixes = ['below-', 'above-']
export const compoundPrefixes = ['below', 'above', 'for', 'sort']

export const typePrefixes = ['luxury', 'premium', 'open', 'sold', 'all', 'any']

export const typeValues = [
  'land',
  'semi',
  'townhome',
  'detached',
  'business',
  'commercial'
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
