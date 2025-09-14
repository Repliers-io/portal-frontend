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
  terms: '/terms-of-use',

  // will be set to home or dashboard or agent
  loginRedirect: '/'
}

export type Routes = Record<keyof typeof routes, string>

export default routes
