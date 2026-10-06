// Feature flags for "defaults". Generated — do not edit by hand. Read via
// `import features from '@configs/features'`.
const features = {
  /** AI agent chat integration (embedded EVAS iframe). */
  aiAgent: false,
  /** Conversational AI chat entry point in search. */
  aiChat: true,
  /** Search listings by image / visual similarity. */
  aiImageSearch: true,
  /** AI photo-quality scoring on listing images. */
  aiQuality: true,
  /** Natural-language query parsing into MLS filters. */
  aiSearch: true,
  /** AI room / space detection in listing photos. */
  aiSpaces: true,
  /** Blog / editorial pages (CMS-backed). */
  blog: true,
  /** Blur restricted listings for guests (MLS privacy, displayPublic=N). */
  blurRestrictedProperty: false,
  /** Buildings / condos directory (WordPress ACF). */
  buildings: false,
  /** Cookie-consent banner. */
  cookieConsent: true,
  /** Market dashboard pages. */
  dashboard: true,
  /** Home valuation / AVM estimate flow. */
  estimate: true,
  /** Save favorite listings (requires auth). */
  favorites: true,
  /** Save favorite listing photos. */
  imageFavorites: true,
  /** LiveBy demographics / neighborhood overlays. */
  liveBy: true,
  /** Locations / neighborhoods directory (pre-generated JSON). */
  locations: false,
  /** Interactive map search. */
  map: true,
  /** Agent contact / messaging. */
  messaging: true,
  /** Open-house listings and filters. */
  openHouse: false,
  /** User profile management. */
  profile: true,
  /** Public-record (assessor) parcels: map overlay + listing parcel facts. */
  publicRecord: true,
  /** Recently-viewed listings history. */
  recentlyViewed: true,
  /** Save search filters (requires auth). */
  saveSearch: true
}

export type Features = typeof features

export default features
