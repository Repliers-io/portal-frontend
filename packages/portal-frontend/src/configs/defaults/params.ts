const paramNames = {
  gridPage: 'gp',
  apiPage: 'ap',
  minPrice: 'pmin',
  maxPrice: 'pmax',
  baths: 'bt',
  beds: 'bd',
  parking: 'p',
  garage: 'g',
  homeType: 'ht',
  sortBy: 'sort',
  status: 'st',
  amenities: 'am',
  minSqFt: 'sqmin',
  maxSqFt: 'sqmax',
  minListDate: 'ldmin',
  maxListDate: 'ldmax',
  zoom: 'z',
  query: 'q',
  layers: 'layers',
  propertyType: 'pt',
  listingStatus: 'ls',
  daysOnMarket: 'dm',
  soldWithin: 'sw',
  yearBuiltFrom: 'yfrom',
  yearBuiltTo: 'yto',
  mode3D: '3d',
  // WARN: must not collide with listing filter keys (e.g. `style`) — filters
  // are spread into the same map URL query namespace
  mapStyle: 'ms'
}

export default paramNames
