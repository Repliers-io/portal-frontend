/**
 * Search behavior config: autosuggest, card-grid paging, map clustering, and MLS
 * board routing. Import as `import search from '@configs/search'`.
 *
 * Board routing: a listing on a board in `distinctBoardIds` is fetched and linked
 * with that board, spelled out as a trailing `-{boardId}` suffix on its URL; every
 * other listing routes to `defaultBoardId` and links without a suffix. A URL that
 * carries no suffix always reads `defaultBoardId`, which is what keeps links minted
 * before a board joined the list working.
 */
const base = {
  /** Header autosuggest: max results shown in the type-ahead. */
  trieMaxResults: 3,
  /** Header autosuggest: min characters typed before suggesting. */
  minCharsToSuggest: 3,
  /** Card grid: listings per page (client-side page size). */
  pageSize: 24,
  /** Card grid: listings fetched per API request. */
  resultsPerPage: 96,
  /**
   * Map clustering: `clusterPrecision` is sent as the map zoom plus this delta.
   * Repliers clusters by web-map tile at that zoom, so each step halves the
   * cluster cell on screen (+2 ≈ 128px, +1 ≈ 256px). Integer only — Repliers
   * rejects a fractional precision.
   */
  clusterPrecisionDelta: 2,
  /** Map clustering: max clusters requested. */
  clusterLimit: 200,
  /**
   * Minimum cluster size: clusters with count <= threshold arrive with those
   * listings inlined in full card shape (cluster.listings, shaped by the
   * clusterFields request param) and render as individual markers at their own
   * coordinates, mixed in with the cluster circles.
   * https://help.repliers.com/en/article/map-clustering-implementation-guide-1c1tgl6/
   */
  clusterListingsThreshold: 4,
  /** MLS board id. Multi-board TRREB tenants set this to the VOW board. */
  defaultBoardId: 110,
  /**
   * Boards addressed by their own id instead of being collapsed onto
   * `defaultBoardId`, both when fetching a listing's detail and when building its
   * URL. Two reasons put a board here: its MLS-number namespace differs from the
   * default board's, so the default board holds no such number; or its copy of a
   * listing differs from the default board's in content or in who may see it.
   * Listing `defaultBoardId` itself is allowed and makes every board explicit in
   * the URL. Empty means every listing routes to `defaultBoardId`.
   */
  distinctBoardIds: [] as number[],

  /** Radius (km) for the "similar listings" query on the PDP. */
  similarListingsRadius: 15,
  /**
   * Remove `filters` that have location polygons and extract those polygons as an
   * extra array for map search.
   */
  extractLocationPolygons: false,
  /**
   * When true and `mapConfig.searchArea.boundary` is set, every `map=` query is
   * intersected with the boundary polygon before being sent to the API.
   */
  constrainToSearchBoundary: false
}

const config = {
  ...base,
  /** Where the search/autosuggest input is placed in the UI. */
  autosuggestPosition: 'menu' as 'menu' | 'filters' | 'disabled'
}

export type SearchConfig = typeof config

export default config
