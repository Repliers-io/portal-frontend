/** Max listings the API returns per request */
export const apiPageSize = 100

/** Number of parallel API requests per sitemap page → 5 × 100 = 500 listings */
export const requestsPerSitemap = 5

/** Total listings per sitemap entry */
export const listingsPerSitemap = apiPageSize * requestsPerSitemap

/** Sitemaps advertise only publicly displayable listings (MLS privacy). */
export const publicOnly = { displayPublic: 'Y' } as const
