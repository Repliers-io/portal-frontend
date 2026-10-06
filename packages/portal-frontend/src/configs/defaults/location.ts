import { type LocationDataSource, type LocationType } from 'services/API/types'

export type PopularSearch = { filters: string[]; search?: string }

/**
 * Geography + locations-directory config: the tenant's home region, the location
 * data source, popular-search shortcuts, and the SEO/pagination thresholds for
 * `/locations` pages. Import as `import location from '@configs/location'`.
 *
 * `stateCode`/`state`/`city` and `source` are the fields every tenant MUST set to
 * point the app at its own market (see `source` below).
 */
const location = {
  /** Two-letter state/province code; used in URLs when `useStateCodeRoute` is true. */
  stateCode: 'TX',
  /** Full state/province name (display + SEO copy). */
  state: 'Texas',
  /**
   * Value sent as the Repliers `state=` filter in listing/location queries.
   * Repliers stores state per board in different formats — some boards use the
   * full name ("Ontario"), others the 2-letter code ("ON") — so this is verified
   * per tenant and kept separate from `state` (display) and `stateCode` (URL).
   * Every tenant MUST set it; the spread base won't carry a correct value.
   */
  stateFilter: 'TX',
  /** Primary city (home-page stats + default map framing). */
  city: 'Austin',
  /** Filters seeded on the home page market stats. */
  defaultFilters: {
    city: ['Austin']
  },
  /** Cities listed in the dashboard picker. */
  defaultCities: ['Austin', 'Kansas City', 'Nashville', 'Charlotte', 'Denver'],
  /** Curated neighborhoods surfaced as quick links (empty = none). */
  popularHoods: [],
  /** Curated cities surfaced as quick links. */
  popularCities: [],
  /** Curated condo buildings surfaced as quick links. */
  popularCondos: [],
  /** Prebuilt filter shortcuts shown as "popular searches" chips. */
  popularSearches: [
    { filters: ['houses', 'for-sale'] },
    { filters: ['condos', 'for-sale'] },
    { filters: ['townhomes', 'for-sale'] },
    { filters: ['houses', 'for-rent'] },
    { filters: ['condos', 'for-rent'] },
    { filters: ['houses', 'above-800k'] },
    { filters: ['condos', 'above-500k'] },
    { filters: ['2-bedrooms', 'houses', 'for-sale'] },
    { filters: ['3-bedrooms', 'houses', 'for-sale'] },
    { filters: ['4-bedrooms', 'houses', 'for-sale'] },
    { filters: ['3-bathrooms', 'houses', 'for-sale'] },
    { filters: ['3-garages', 'houses', 'for-sale'] }
  ] as PopularSearch[],
  /**
   * Whether to use state code as route prefix for location URLs
   * When true: /ma/boston, /ma/boston/downtown
   * When false: /locations/boston, /locations/boston/downtown
   * Used in: middleware.ts for URL rewriting, utils/urls.ts for URL generation
   * @default true
   */
  useStateCodeRoute: true,

  /**
   * Query the /locations page listings by the pre-resolved `locationId` (found by
   * matching the URL's SEO names against the cached locations tree in
   * `fetchLocationsData`) instead of city/area/neighborhood address strings. A
   * precise geo-filter that avoids the address route's propertyType expansion.
   * Off by default; enable per tenant whose tree ids line up with the listings API.
   */
  searchListingsByLocationId: false,

  // LOCATIONS PAGE CONSTANTS
  /**
   * Maximum number of nearby locations to display
   * Used in: NearbyLocations component
   */
  maxNearbies: 24,
  /**
   * Search radius in km for nearby locations
   * Used in: fetchLocationsData helper
   */
  nearbyRadius: 50,
  /**
   * Maximum number of child locations (neighborhoods) to display
   * Used in: HoodsOfCity, CitiesOfRegion components
   */
  maxChilds: 16,
  /**
   * Maximum number of secondary cities to list in SEO description
   * Used in: SeoDescription component (cities after main and major cities)
   */
  maxSeoCities: 25,
  /**
   * Maximum number of neighborhoods to fetch map data for on a city page.
   * Prevents the API request URL from exceeding length limits when a city
   * has many neighborhoods (e.g. Toronto). Sorted by activeCount descending.
   * Used in: fetchLocationsData in LocationsTree/fetchers.ts
   */
  maxSeoHoods: 100,
  /**
   * Maximum number of neighborhoods to show listing count for in SEO description
   * Used in: SeoDescription component
   */
  maxSeoHoodsWithCount: 5,
  /**
   *  Minimum number of listings required to show count for a city in SEO description
   * Used in: AreaDescription component
   */
  minSeoCityCount: 10,
  /**
   * Minimum number of listings required to show count for a neighborhood in SEO description
   * Used in: CityDescription component
   */
  minSeoHoodCount: 10,
  /**
   * Maximum number of major cities to highlight in SEO description
   * Major cities = cities with at least (mainCity.activeCount * majorCityFactor) listings
   * Used in: SeoDescription component
   */
  maxSeoMajorCities: 5,
  /**
   * Minimum percentage of main city's listings for a city to be considered "major"
   * 0.1 = 10% - city must have at least 10% of the main city's listings count
   * Used in: SeoDescription component to filter majorCities
   */
  majorCityFactor: 0.1,
  /**
   * Minimum total listings count for an area to be considered valid (not trash)
   * Areas below this threshold are filtered out from the location tree
   * Used in: LocationsTree pipeline (markAreasByThreshold), generate-locations-tree script
   */
  areaThreshold: 200,
  /**
   * What the locations generator counts per location: off, the listings listed in the
   * last 90 days, active or sold; on, every active listing whatever its list date. A
   * location counted 0 is dropped from the tree, so on a board whose active stock is
   * mostly older than 90 days (REBNY) the default drops neighbourhoods with listings.
   */
  activeCounts: false,
  /**
   * Whether the location hierarchy includes an area level (e.g. "Denver Area")
   * When true: area breadcrumb items and area-level URLs are shown
   * When false: area is skipped in breadcrumbs and navigation
   */
  showAreas: true,
  /**
   * Areas the URL grammar writes in the city position, without the `-area`
   * marker: `/on/toronto/north-york` instead of `/on/toronto-area/north-york`.
   * For a place the board records as an area whose children are cities — TRREB
   * files Toronto that way, with North York and Scarborough beneath it — so the
   * name people use as a city is an area in the tree.
   *
   * The short form of a listed area already works without this (resolveLocation
   * answers a lone `/on/toronto` from the area); the list is what lets a city
   * and a neighbourhood follow it.
   *
   * Only list a name **no city shares**: the listed name stops resolving as a
   * city, so on a tenant that has both an area and a city called Toronto
   * (gta-portal) the city page would become unreachable.
   *
   * Used in: `app/locations/[[...slugs]]/_utils/parsers.ts`
   */
  cityPositionAreas: [] as string[],
  /**
   * This tenant's location data source — sent on every `/locations` request (the
   * locations generator's included) and on autosuggest, and echoed back on each
   * location. A `locationId` lookup goes without it: ids are namespaced by source
   * and resolve across all of them. The default (`defaults`) app uses `'LiveBy'`.
   * Every OTHER tenant spreads this base config and MUST override `source` —
   * `'MLS'` for the default source, `'LiveBy'` (serhant), `'UserDefined'`
   * (movesmartly) — exactly like `stateCode`/`city` above.
   */
  source: 'LiveBy' as LocationDataSource,
  /**
   * Location types the locations generator fetches as the tree's city level.
   * LiveBy files New York's boroughs as `city-alternate` and the postal cities as
   * `city`, so a tenant can keep only one of them.
   */
  cityTypes: ['city', 'city-alternate'] as LocationType[],
  /** Location types the locations generator fetches as the tree's neighbourhood level. */
  neighborhoodTypes: [
    'neighborhood',
    'neighborhood-alternate'
  ] as LocationType[],
  /**
   * Hang every neighbourhood under the city of its area, matched by `address.area`
   * alone. For sources whose neighbourhoods carry a postal `address.city` that names
   * no city of the tree: LiveBy marks most New York neighbourhoods "New York", in
   * every borough. Assumes one city per area.
   */
  hoodsByArea: false,
  /**
   * A listing's `address.area` → the tree city standing for it, for boards that give
   * the whole region one `address.city` and record the division in `area`: REBNY
   * lists every unit in "New York City" and files the borough as its county
   * (`Kings` → Brooklyn). Read by the listing breadcrumbs, and by the dashboard and the
   * catalog's address query for a neighbourhood outside the tree, which query such a
   * city by its `area`.
   */
  areaCities: {} as Record<string, string>
}

export default location
