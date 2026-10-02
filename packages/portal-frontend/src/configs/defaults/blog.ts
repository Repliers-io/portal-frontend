const blog = {
  postsPerPage: 12,
  similarPostsCount: 3,
  // Candidate pool size per taxonomy query (categories / tags) for similar posts.
  // WP orders by date desc, so this caps how many recent same-category/-tag posts are
  // considered before scoring. Raise it if older but strongly-matching posts are missed.
  similarPoolSize: 10,
  excludeNavigationPostsFromSimilar: false,
  includeCategoriesInSimilar: true,
  paginationType: 'classic' as 'loadMore' | 'classic', // 'loadMore' - infinite scroll with button, 'classic' - numbered pages
  menuSlug: 'repliersmenu', // WordPress menu slug for blog navigation
  dateFormats: {
    postHeader: 'MMMM D, YYYY',
    postCard: 'MMMM D, YYYY'
  },
  // WordPress custom post types (empty by default, override in instance configs)
  customPostTypes: [] as const,
  // Shortcode replacement mapping (empty by default, override in instance configs)
  // Maps WordPress shortcodes to component markers
  shortcodeReplacements: {} as Record<string, string>,
  // Shortcodes to remove from content (empty by default, override in instance configs)
  // Uses startsWith matching, so 'optima_express' will match all optima_express_* shortcodes
  removeShortcodes: [] as string[],
  // Featured authors whitelist for home page and author pages (empty = show all)
  featuredAuthors: [] as string[]
}

export default blog
