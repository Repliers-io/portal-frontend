import React from 'react'

import {
  IntentionsSection,
  MortgageSection
} from '@pages/estimate/EstimateFormSteps/sections'

import { GridContainer } from '../components'

const IntentionsStep = () => {
  return (
    <GridContainer>
      <IntentionsSection />
      <MortgageSection />
    </GridContainer>
  )
}

export default IntentionsStep
