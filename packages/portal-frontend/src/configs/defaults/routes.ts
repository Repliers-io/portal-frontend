/**
 * Canonical URL path for every named route in the app. Import as
 * `import routes from '@configs/routes'` and reference routes by name
 * (e.g. `routes.search`) instead of hard-coding paths, so a tenant can rename a
 * path in a single place without hunting for string literals.
 */
const routes = {
  home: '/',
  login: '/login',

  search: '/search',
  map: '/search/map',
  /** Toolbar alias that opens the AI dialog on the map view. */
  ai: '/search/map?dialog=ai',
  grid: '/search/grid',
  chat: '/search/chat',

  city: '/search/city',
  area: '/search/area',
  address: '/search/address',

  /** Listing detail page; matches the dynamic segment `/listing/[...id]`. */
  listing: '/listing',
  locations: '/locations',
  /** Single building page: `/building/[slug]`. */
  building: '/building',
  /** Buildings index and browse. */
  buildings: '/buildings',
  /** Single building within the location tree. */
  condo: '/condo',
  /** Location-scoped buildings index. */
  condos: '/condos',
  estimate: '/estimate',
  dashboard: '/dashboard',
  favorites: '/favorites',
  saveSearch: '/saved-searches',
  imageFavorites: '/image-favorites',
  recentlyViewed: '/recently-viewed',
  profile: '/profile',

  /** Estimates management (agent-facing). */
  admin: '/admin',
  adminAgents: '/admin/agents',

  agent: '/agent',
  /** Agent's client view: `/agent/client/[...id]`. */
  agentClient: '/agent/client',

  // content pages
  blog: '/blog',
  authors: '/authors',
  /** Single author: `/author/[slug]`. */
  author: '/author',
  /** Single static page: `/page/[...slug]`. */
  staticPage: '/page',
  /** Browse static pages: `/pages/[...path]`. */
  staticPages: '/pages',
  widgets: '/widgets',

  // Legacy root-level static pages — aliases to /pages/[slug].
  privacy: '/privacy-policy',
  terms: '/terms-of-use',
  cookies: '/cookies-policy',
  dmca: '/dmca-notice',
  accessibility: '/accessibility',
  contact: '/contact-us',
  about: '/about',
  subscribe: '/subscribe',
  buy: '/buy',
  sell: '/sell',

  /** Post-login target; resolved at runtime to home, dashboard, or agent. */
  loginRedirect: '/',

  /** Root landing mode: 'landing' → "/", 'estimate' → "/estimate". */
  rootPage: 'landing' as 'landing' | 'estimate'
}

export type Routes = Record<keyof typeof routes, string>

export default routes
