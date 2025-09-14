const config = {
  apiRequestTimeout: 20_000, // 20 seconds
  // Google Maps API
  gmapsApiUrl: 'https://maps.googleapis.com/maps/api/',
  gmapsApiKey: process.env.NEXT_PUBLIC_GMAPS_KEY || '',
  // Google Places API key (used server-side only, not exposed to the client)
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  // Follow Up Boss CRM
  fubApiUrl:
    process.env.NEXT_PUBLIC_FUB_URL ||
    'https://works1.followupboss.com/2/people/view',
  // Repliers property images CDN
  repliersCdn: 'https://cdn.repliers.io'
}

export default config
