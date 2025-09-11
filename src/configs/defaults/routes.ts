const routes = {
  home: '/',
  login: '/login',

  search: '/search',
  map: '/search/map',
  ai: '/search/map?dialog=ai', // NOTE: alias for the toolbar
  grid: '/search/grid',

  city: '/search/city',
  area: '/search/area',
  address: '/search/address',

  listing: '/listing', // [...id]
  listings: '/listings',
  estimate: '/estimate',
  dashboard: '/dashboard',
  favorites: '/favorites',
  saveSearch: '/saved-searches',
  imageFavorites: '/image-favorites',
  recentlyViewed: '/recently-viewed',
  profile: '/profile',

  // estimates management
  admin: '/admin',
  adminAgents: '/admin/agents',

  agent: '/agent',
  agentClient: '/agent/client', // [...id]

  // static pages
  cookies: '/cookies-policy',
  privacy: '/privacy-policy',
  terms: '/terms-of-use'
}

export type Routes = Record<keyof typeof routes, string>

export const loginRedirectRoute = routes.home

export default routes
