import { type Metadata } from 'next'
import deepmerge from 'deepmerge'

import { type CmsMetaDefaults } from 'utils/metadata'

/**
 * Shape of per-page metadata entries in `content.pagesMeta`.
 * Keeps title/description as plain strings (not Metadata['title'] union)
 * so pages can use them directly in openGraph/twitter fields without casts.
 */
export type PageMeta = {
  title?: string
  description?: string
  openGraph?: Metadata['openGraph']
  twitter?: Metadata['twitter']
  robots?: Metadata['robots']
  alternates?: Metadata['alternates']
}

/**
 * Script loading strategy (Next.js Script component strategies)
 * - beforeInteractive: Load before page becomes interactive (critical scripts)
 * - afterInteractive: Load after page becomes interactive (default, non-critical)
 * - lazyOnload: Load during browser idle time (lowest priority)
 * - worker: Load in a web worker (experimental)
 */
export type ScriptStrategy =
  | 'beforeInteractive'
  | 'afterInteractive'
  | 'lazyOnload'
  | 'worker'

/**
 * External script loaded from URL
 */
export interface ExternalScript {
  type: 'external'
  /** Script URL (can be absolute or relative) */
  src: string
  /** Loading strategy (default: 'lazyOnload') */
  strategy?: ScriptStrategy
  /** Optional script ID for tracking */
  id?: string
  /** Async loading */
  async?: boolean
  /** Defer loading */
  defer?: boolean
}

/**
 * Inline script with code embedded directly
 */
export interface InlineScript {
  type: 'inline'
  /** JavaScript code to execute */
  code: string
  /** Loading strategy (default: 'lazyOnload') */
  strategy?: ScriptStrategy
  /** Optional script ID for tracking */
  id?: string
}

/**
 * Union type for all script configurations
 */
export type CustomScript = ExternalScript | InlineScript

/**
 * Array of custom scripts to be injected into pages
 */
export type CustomScripts = CustomScript[]

/**
 * Site identity, branding assets, contact info, SEO metadata, and injected scripts.
 * Import as `import content from '@configs/content'`. Tenants override via
 * `mergeContent(instanceContent)` so nested objects (siteMetadata,
 * pagesMeta) merge field-by-field. Logo/splashscreen paths are served from
 * `public/<tenant>/`.
 */
const content = {
  /** Header logo `{ url, width, height }`; url resolves under `public/`. */
  siteLogo: { url: '/logo.svg', width: 36, height: 36 },
  /** Compact logo used on mobile / narrow headers. */
  siteMobileLogo: { url: '/logo.svg', width: 36, height: 36 },
  /** Footer logo (usually larger / monochrome). */
  siteFooterLogo: { url: '/logo-footer.svg', width: 80, height: 80 },
  /** Splash screen image(s); array = randomized/rotating. */
  siteSplashscreen: '/splashscreen.webp' as string | string[],
  siteSplashscreenMobile: '/splashscreen.webp',
  loginSplashscreen: '/splashscreen.webp',
  /** Brand name used in titles, footer, and metadata. */
  siteName: 'DEFAULTNAME',
  contactEmail: 'contact@defaultname.com',
  contactPhone: '+1-555-555-5555',
  /** Brokerage office id sent with MLS requests. */
  officeId: 'XXX0000000',
  /**
   * Exclude the whole build from search-engine indexing and crawling.
   * `true` renders `<meta name="robots" content="noindex, nofollow">` (layout)
   * and sends `X-Robots-Tag: noindex, nofollow` (proxy). The base default is
   * `true`, so the demo build — and any tenant without an explicit override —
   * stays out of the index; live production tenants opt in with `noIndex: false`.
   */
  noIndex: true,
  /** Next.js `Metadata` for the app shell (title template, OG, icons, keywords). */
  siteMetadata: {
    title: {
      template: 'DEFAULTNAME > %s',
      default: 'DEFAULTNAME' // fallback
    },
    // metadataBase: new URL('https://smartmls.com/'), // canonical URL
    alternates: {
      canonical: '/'
    },
    generator: 'Next.js',
    applicationName: 'DEFAULTNAME',
    referrer: 'origin-when-cross-origin',
    keywords: [],
    // authors: [{ name: 'John' }, { name: 'Jane' }],
    // formatDetection: {
    //   email: false,
    //   address: false,
    //   telephone: false
    // },
    description:
      'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
    openGraph: {
      type: 'website' as const
    },
    twitter: {
      card: 'summary_large_image' as const
    },
    icons: {
      // Default portal favicon: the house logo (same asset as the header `siteLogo`).
      // SVG for modern browsers; the root favicon.ico stays as a legacy fallback.
      icon: [
        { url: '/logo.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico' }
      ]
    }
  } as Metadata,
  /**
   * Whitelist of available static page slugs
   * These pages will be used for SSG and routing
   */
  staticPageSlugs: [
    'privacy-policy',
    'terms-of-use',
    'cookies-policy',
    'dmca-notice',
    'accessibility',
    'contact-us',
    'about'
  ] as string[],
  /**
   * Custom scripts to inject into all pages
   * Supports both external URLs and inline code
   * This can be overridden per instance
   */
  customScripts: [] as CustomScripts,
  /**
   * Per-page metadata defaults. Keys are logical page names (not route paths —
   * routes vary per tenant). Values support `{token}` placeholders substituted at
   * runtime in `generateMetadata`. Tenant configs override any entry via deepmerge.
   */
  pagesMeta: {
    home: {
      // No title default — falls back to siteMetadata.title.default.
      // Tenants that need a distinct homepage title can set this explicitly.
      description:
        'Search homes for sale, condos, and rentals. Browse listings with photos, prices, and neighbourhood details.'
    },
    estimate: {
      title:
        'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
      description:
        'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
      openGraph: { type: 'website' as const }
    },
    estimateResult: {
      title: '{address} Property Valuation Report',
      description:
        'View your comprehensive {location} home valuation. AI-powered insights, neighbourhood trends, and market data for informed decisions.'
    },
    missingProperty: {
      title: "Listing you are looking for isn't there.",
      description: "Listing you are looking for isn't there."
    },
    authors: {
      title: 'Authors',
      description: 'Browse all blog authors',
      openGraph: { type: 'website' as const }
    },
    buildings: {
      title: 'Buildings',
      description:
        'Browse all available buildings and real estate developments.'
    },
    buildingsBrowse: {
      description: 'Browse {type} buildings'
    },
    building: {
      description: 'Explore {name} listings, photos, and real estate details.'
    },
    locations: {
      // description is appended as a suffix to the dynamically built location description
      description: '. View listing photos, prices, and neighbourhood details.'
    },
    search: {
      title: 'Search Results',
      description:
        'Browse available homes, condos, and rentals. Filter by price, location, property type and more.',
      openGraph: {
        type: 'website' as const
      }
    },
    blog: {
      title: 'Blog',
      description: 'Latest articles and insights',
      openGraph: { type: 'website' as const }
    },
    pagesIndex: {
      title: 'Pages',
      description: 'Browse all available pages',
      openGraph: { type: 'website' as const }
    },
    pagesBrowse: {
      title: 'Pages in {path}',
      description: 'Browse all pages in {path}'
    },
    condosBrowse: {
      title: 'Buildings in {location}',
      description:
        'Browse condo buildings and developments in {location}. View photos, prices, floor plans, and availability.'
    },
    condo: {
      description:
        'Browse available units at {buildingName}. View floor plans, prices, photos, and building details.'
    },
    // Dynamic template keys — route files substitute {page}, {tag}, {category} tokens
    blogPage: {
      title: 'Blog - Page {page}',
      description: 'Latest articles and insights'
    },
    blogTag: {
      title: 'Posts tagged with "{tag}"',
      description: 'Browse all blog posts tagged with {tag}'
    },
    blogTagPage: {
      title: 'Posts tagged with "{tag}" - Page {page}',
      description: 'Browse blog posts tagged with {tag}'
    },
    blogCategory: {
      title: 'Posts in "{category}" category',
      description: 'Browse all blog posts in {category} category'
    },
    dashboard: {
      title: 'Market Dashboard',
      description:
        'Explore real estate market trends, price statistics, and neighbourhood insights.',
      openGraph: { type: 'website' as const }
    },
    // {city} is substituted at runtime in generateMetadata
    dashboardCity: {
      title: '{city} Market Dashboard',
      description:
        'Real estate market trends and statistics for {city}. Explore prices, inventory, and neighbourhood data.'
    },
    dashboardResidential: {
      title: '{city} Residential Market Report',
      description:
        'Residential real estate market trends and statistics for {city}.'
    },
    dashboardCondo: {
      title: '{city} Condo Market Report',
      description: 'Condo market trends and statistics for {city}.'
    }
  } as Record<string, PageMeta>,
  cmsMetaDefaults: {} as CmsMetaDefaults

  // Example: Custom scripts configuration
  // Uncomment and configure as needed for this instance
  // customScripts: [
  //   // Example 1: External analytics script
  //   {
  //     type: 'external',
  //     src: 'https://www.googletagmanager.com/gtag/js?id=GA-XXXXX',
  //     strategy: 'afterInteractive',
  //     id: 'google-analytics'
  //   },
  //   // Example 2: Inline analytics initialization
  //   {
  //     type: 'inline',
  //     strategy: 'afterInteractive',
  //     id: 'ga-init',
  //     code: `
  //       window.dataLayer = window.dataLayer || [];
  //       function gtag(){dataLayer.push(arguments);}
  //       gtag('js', new Date());
  //       gtag('config', 'GA-XXXXX');
  //     `
  //   },
  //   // Example 3: Third-party widget
  //   {
  //     type: 'external',
  //     src: 'https://widget.example.com/embed.js',
  //     strategy: 'lazyOnload',
  //     async: true
  //   },
  //   // Example 4: Custom inline functionality
  //   {
  //     type: 'inline',
  //     strategy: 'lazyOnload',
  //     code: `
  //       console.log('Urban Living custom script loaded');
  //       // Your custom code here
  //     `
  //   }
  // ]
}

export type Content = typeof content

/**
 * Merge a tenant's overrides over the defaults. Arrays REPLACE rather than
 * concatenate: a tenant list (icons, keywords, page slugs) is a complete
 * override, and appending it would leave the default portal's own entries —
 * the house-logo favicon above all — ahead of the tenant's.
 */
export const mergeContent = (instance: Partial<Content>): Content =>
  deepmerge(content, instance, { arrayMerge: (_, source) => source })

export default content
