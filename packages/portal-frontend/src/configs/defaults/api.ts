/**
 * External API endpoints and keys used across the app. Import as
 * `import api from '@configs/api'`.
 *
 * The frontend never calls the Repliers MLS API directly: `apiUrl` points at the
 * proxy backend, which forwards requests to Repliers. Keys sourced from env vars are
 * empty strings when unset so the app degrades gracefully instead of throwing.
 */
const config = {
  /** Abort timeout for API requests, in milliseconds. */
  apiRequestTimeout: 20_000,
  /** Attempts a server-side request makes before a transient failure is surfaced. */
  apiRequestRetries: 3,
  /** Linear backoff between retries, in milliseconds (attempt × this). */
  apiRetryBackoff: 1_000,
  /** Base URL of the Repliers API proxy backend (`NEXT_PUBLIC_API_URL` + `/api`). */
  apiUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  /** Repliers CDN host for property images. */
  repliersCdn: 'https://cdn.repliers.io',
  /** Google Maps REST API base (geocoding, static maps). */
  gmapsApiUrl: 'https://maps.googleapis.com/maps/api/',
  /** Google Maps browser key (`NEXT_PUBLIC_GMAPS_KEY`). */
  gmapsApiKey: process.env.NEXT_PUBLIC_GMAPS_KEY || '',
  /** Google Places key — used server-side only, never exposed to the client (`GOOGLE_PLACES_API_KEY`). */
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  /** Follow Up Boss CRM deep-link base (`NEXT_PUBLIC_FUB_URL`). */
  fubApiUrl:
    process.env.NEXT_PUBLIC_FUB_URL ||
    'https://works1.followupboss.com/2/people/view'
}

export default config
