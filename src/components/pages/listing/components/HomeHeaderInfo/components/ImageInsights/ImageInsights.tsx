import { Stack } from '@mui/material'

import {
  type PropertyInsightFeature,
  propertyInsightFeatures
} from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { getQualityFeatureLabel, getQualityLabel } from 'utils/properties'

import QualityBar from './components/QualityBar'

const ImageInsights = () => {
  const {
    property: { imageInsights }
  } = useProperty()

  if (!imageInsights) return null

  const qualityFeatures = imageInsights.summary.quality.qualitative.features
  const quantityFeatures = imageInsights.summary.quality.quantitative.features

  const featuresList = Object.entries(qualityFeatures).map(([key, value]) => ({
    key: key as PropertyInsightFeature,
    label: getQualityFeatureLabel(key),
    quality: getQualityLabel(value),
    quantity: quantityFeatures[key as keyof typeof quantityFeatures] || null
  }))

  const sortedFeaturesList = propertyInsightFeatures
    .map((featureKey) => featuresList.find((f) => f.key === featureKey))
    .filter((feature) => !!feature)
    .sort((a, b) => {
      const number1 = a.quantity || 0
      const number2 = b.quantity || 0
      return number1 > number2 ? -1 : number1 < number2 ? 1 : 0
    })

  const overallQuality = imageInsights.summary.quality.qualitative.overall
  const overallQuantity = imageInsights.summary.quality.quantitative.overall

  return (
    <Stack
      direction="row"
      spacing={{ xs: 2, md: 4 }}
      flexWrap="wrap"
      sx={{ py: 0.5 }}
    >
      <QualityBar
        label="Overall"
        quality={getQualityLabel(overallQuality)}
        quantity={overallQuantity}
      />

      {sortedFeaturesList.map((featureData, index) => {
        return (
          <QualityBar {...featureData} groupKey={featureData.key} key={index} />
        )
      })}
    </Stack>
  )
}

export default ImageInsights
