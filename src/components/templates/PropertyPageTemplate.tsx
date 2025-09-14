'use client'

import React from 'react'

import { Box } from '@mui/material'

import PropertyPageContent from '@pages/listing'

import { type Property } from 'services/API'
import { useFeatures } from 'providers/FeaturesProvider'
import PropertyDetailsProvider from 'providers/PropertyDetailsProvider'
import PropertyProvider from 'providers/PropertyProvider'

import { PageTemplate } from '.'

const PropertyPageTemplate = ({ property }: { property: Property }) => {
  const features = useFeatures()
  const noHeader = !features.pdpHeader

  return (
    <PageTemplate noHeader={noHeader}>
      <PropertyProvider property={property}>
        <PropertyDetailsProvider property={property}>
          <Box
            sx={{
              width: '100%',
              pt: { xs: 0, sm: 2 },
              overflow: { xs: 'hidden', md: 'visible' }
            }}
          >
            <PropertyPageContent />
          </Box>
        </PropertyDetailsProvider>
      </PropertyProvider>
    </PageTemplate>
  )
}

export default PropertyPageTemplate
