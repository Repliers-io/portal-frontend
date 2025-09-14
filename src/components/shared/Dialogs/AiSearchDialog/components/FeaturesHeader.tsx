import React from 'react'

import { Typography } from '@mui/material'

import aiConfig from '@configs/ai-search'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'

import { FeatureButton } from '.'

const FeaturesHeader = () => {
  const { features, submit } = useAiSearch()
  const { hideDialog } = useDialog('ai')

  const addFeature = (feature: string) => {
    if (features.includes(feature)) return
    submit({ features: [feature] })
    hideDialog()
  }

  return (
    <Typography align="center" sx={{ py: 2, px: { xs: 0, md: 10 } }}>
      Use AI to personalise your search. Describe features that you are looking
      for (e.g.
      {aiConfig.examples.map(([label, color]) => (
        <React.Fragment key={label}>
          <FeatureButton color={color} onClick={addFeature}>
            {label}
          </FeatureButton>
          ,{' '}
        </React.Fragment>
      ))}
      etc) or upload an image of a property that you like and see listings with
      them!
    </Typography>
  )
}

export default FeaturesHeader
