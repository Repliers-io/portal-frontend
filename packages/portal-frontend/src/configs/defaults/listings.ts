import { type ApiLastStatus } from 'services/API'

/**
 * Listing card + listing-detail-page (PDP) configuration: gallery sizing, premium
 * price thresholds, restricted-data handling, MLS status labels, and which PDP
 * blocks render. Import as `import listings from '@configs/listings'`.
 *
 * The `components` toggles here own the former `pdp*` feature flags (they moved out
 * of `@configs/features` — a block hidden here still leaves the page intact, so it is
 * config, not a capability). See the features-vs-config rule in the docs.
 */
const config = {
  /** Price thresholds (in listing currency) above which a listing is treated as "premium". */
  pricing: {
    premiumCondo: 950_000,
    premiumResidential: 1_125_000
  },

  gallery: {
    thumbWidth: 284,
    thumbHeight: 190,
    borderRadius: 2,
    /** Blur radius in px applied to restricted images. */
    blurRadius: 20,
    /** Fake house shown blurred for restricted listings without images; set '' to disable. */
    fallbackImage: '/house.webp',
    /** Minimum image count to switch to the 1-2-3 gallery layout. */
    minImagesFor123: 6
  },

  /** Listing nav sticky offset from the top (px); `embedded` = inside the estimate/embed shell. */
  barOffset: {
    static: 484,
    embedded: 416
  },

  /** Sentinel values the MLS API returns for restricted fields, plus the label shown instead. */
  scrubbed: {
    data: '!scrubbed!',
    date: '1900-06-21T01:39:00.000Z',
    // Dummy shown for a redacted date. Not a real date ('XXX XX, 19XX') so crawlers
    // can't index every listing under one bogus 1990 date; also sizes the skeleton bar.
    datePlaceholder: 'XXX XX, 19XX',
    descriptionLabel: 'You have to be logged in to see the description.'
  },

  /** Address ordering: 'us' = "1310 E Union #202" (directional prefix, unit after street). */
  addressFormat: 'default' as 'default' | 'us',

  /**
   * Listing SEO `<title>` strategy. 'default' = verbose (type, status, location, beds,
   * baths, sqft, address); 'compact' = "{address}, {city}, {STATE} {zip} | MLS# {mls}".
   */
  titleFormat: 'default' as 'default' | 'compact',
  notAvailable: 'N/A',
  listingBrowserContainerId: 'listing-content',

  /**
   * Links to OTHER listings shown while viewing a listing (PDP history & similar
   * carousels) or an estimate result (comparables) open in a new tab instead of
   * navigating away from the one being browsed. Modifier-clicks (Ctrl/Cmd/middle)
   * always open a new tab regardless.
   */
  linksInNewTab: true,

  /**
   * Read the PDP history block from the property-level history endpoint instead of the
   * `history` array embedded in the listing detail. The embedded array only covers the
   * board the detail was read from, so multi-board tenants lose everything the other
   * boards hold. The extended answer replaces the embedded one; an error or an empty
   * answer keeps it.
   */
  extendedHistory: false,

  /** MLS `lastStatus` code → display label. */
  statusLabels: {
    Sus: 'Suspended',
    Exp: 'Expired',
    Sld: 'Sold',
    Ter: 'Terminated',
    Dft: 'Deal Fell Through',
    Lsd: 'Leased',
    Sc: 'Sold Conditionally',
    Sce: 'Sold Conditionally with Escape Clause',
    Lc: 'Leased Conditionally',
    Lce: 'Leased Conditionally with Escape Clause',
    Pc: 'Price Change',
    Ext: 'Extension',
    New: 'New',
    Cs: 'Coming Soon'
  } as Record<ApiLastStatus, string>,

  /** In-page anchor sections shown on the PDP, in order. */
  navigationItems: [
    { id: 'description' },
    { id: 'details' },
    { id: 'features' },
    // { id: 'appliances' },
    { id: 'exterior' },
    { id: 'rooms' },
    { id: 'neighborhood' },
    { id: 'liveByDemographics' },
    { id: 'history' }
  ],

  /** Visibility of listing-detail (PDP) blocks; building pages reuse the gallery toggles. */
  components: {
    header: true,
    sidebar: true,
    share: true,
    showcaseCards: true,
    locationStats: false,
    gridGallery: true,
    fullscreenGallery: true,
    slideshow: true,
    /** The tour form in two steps: date, time and tour type, then the contact fields. */
    tourSteps: false
  }
}

export default config
