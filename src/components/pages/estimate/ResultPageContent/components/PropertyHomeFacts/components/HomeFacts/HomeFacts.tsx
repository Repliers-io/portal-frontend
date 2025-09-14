import React from 'react'

import { Paper } from '@mui/material'
import type { BoxProps } from '@mui/system'

import EstimateDetailsContainer from '../../../EstimateDetailsContainer'

import PropertyList from './PropertyList'

type HomeFactsProps = BoxProps

const HomeFacts: React.FC<HomeFactsProps> = () => {
  return (
    <Paper sx={{ height: '100%' }}>
      <EstimateDetailsContainer title="Home Facts">
        <PropertyList />
      </EstimateDetailsContainer>
    </Paper>
  )
}

export default HomeFacts
