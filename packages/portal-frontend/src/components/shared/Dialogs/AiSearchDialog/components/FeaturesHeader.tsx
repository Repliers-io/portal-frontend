import React from 'react'
import { useTranslations } from 'next-intl'

import { Typography } from '@mui/material'

import aiConfig from '@configs/ai-search'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'

import { FeatureButton } from '.'

const FeaturesHeader = () => {
  const { features, submit } = useAiSearch()
  const { hideDialog } = useDialog('ai')
  const t = useTranslations('Dialogs')

  const addFeature = (feature: string) => {
    if (features.includes(feature)) return
    submit({ features: [feature] })
    hideDialog()
  }

  return (
    <Typography align="center" sx={{ py: 2, px: { xs: 0, md: 10 } }}>
      {t.rich('AiSearch.describe', {
        examples: () =>
          aiConfig.examples.map(([label, color]) => (
            <React.Fragment key={label}>
              <FeatureButton color={color} onClick={addFeature}>
                {label}
              </FeatureButton>
              ,{' '}
            </React.Fragment>
          ))
      })}
    </Typography>
  )
}

export default FeaturesHeader
