import React from 'react'

import { CardPaper } from '@shared/Containers'

import EstimateDetailsContainer from '../../../EstimateDetailsContainer'

import PropertyList from './PropertyList'

const HomeFacts = () => {
  return (
    <CardPaper sx={{ height: '100%' }}>
      <EstimateDetailsContainer title="Home Facts">
        <PropertyList />
      </EstimateDetailsContainer>
    </CardPaper>
  )
}

export default HomeFacts
