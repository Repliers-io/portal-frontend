export const apiRequestTimeout = 20_000 // 20 seconds
export const gmapsApiUrl = 'https://maps.googleapis.com/maps/api/'
export const gmapsApiKey = process.env.NEXT_PUBLIC_GMAPS_KEY || ''
export const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY || ''
export const fubApiUrl =
  process.env.NEXT_PUBLIC_FUB_URL ||
  'https://works1.followupboss.com/2/people/view'
