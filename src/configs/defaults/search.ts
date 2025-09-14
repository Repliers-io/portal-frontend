const config = {
  // header autosuggest
  trieMaxResults: 3,
  minCharsToSuggest: 3,
  // card grid
  pageSize: 24,
  resultsPerPage: 96,
  // clustering
  clusterPrecision: 12,
  clusterLimit: 200,
  // boards
  defaultBoardId: 2,
  // VOW boards explanation:
  // https://repliers.com/understanding-mls-data-feeds-idx-vow-and-back-office-whats-the-difference/
  vowBoardId: 2, // same as defaultBoardId

  similarListingsRadius: 15
}

export type SearchConfig = Record<keyof typeof config, number>

export default config
