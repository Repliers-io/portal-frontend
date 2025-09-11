import { type Features, features, payload } from 'features'

export { type Features }

export const createGrowthBook = () => {
  // template for creating a GrowthBook instance
  return {
    initSync: () => {}
  }
}

export const getFeatureValues = () => {
  // template for getting feature values
  return features as Features
}

export const fetchFeatures = async () => {
  // template for fetching features
  return features as Features
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchFeatureOptions = async (mode = '') => {
  // template for fetching feature options
  return { features, options: { payload } }
}
