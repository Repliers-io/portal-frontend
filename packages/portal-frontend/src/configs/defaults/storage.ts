const config = {
  tokenKey: 'token',
  profileKey: 'profile',
  polygonKey: 'polygon',
  cookieKey: 'cookie',
  growthBookKey: 'growthbook',
  authCallbackKey: 'authCallback',
  lastAuthKey: 'lastAuth',
  nlpTokenKey: 'nlpToken',
  nlpHistoryKey: 'nlpHistory',
  estimateDataKey: 'estimateData',
  estimateStepKey: 'estimateStep',
  recentsKey: 'recents',
  neighborhoodSchoolFiltersKey: 'neighborhood.schoolFilters'
}

export type StorageConfig = Record<keyof typeof config, string>

export default config
