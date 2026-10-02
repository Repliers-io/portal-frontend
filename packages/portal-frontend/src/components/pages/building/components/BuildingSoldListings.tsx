'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { GridWidget } from '@shared/CmsWidgets'

import { type ApiBuilding } from 'services/API'
import { getBuildingLabel } from 'utils/buildings'
import { soldDateDesc } from 'utils/listings'

import { BuildingSectionContainer } from '.'

interface BuildingListingsProps {
  building: ApiBuilding
}

export const BuildingSoldListings = ({ building }: BuildingListingsProps) => {
  const t = useTranslations('Building')
  const { address } = building
  const { streetNumber, streetName, city, neighborhood } = address || {}
  const [resultsCount, setResultsCount] = useState<number | null>(null)

  const label = getBuildingLabel(building)
  const title = label ? t('soldTitleAt', { building: label }) : t('soldTitle')

  const handleLoadingChange = (loading: boolean) => {
    window.dispatchEvent(
      new CustomEvent('BuildingSoldListings:loading', { detail: { loading } })
    )
  }

  // Hide section if there are no results (after loading)
  if (resultsCount === 0) return null

  return (
    <BuildingSectionContainer id="sold" title={title}>
      <GridWidget
        maxColumns={3}
        pagination={true}
        listings={{
          listingStatus: 'sold',
          listingType: 'condo',
          sortBy: soldDateDesc,
          resultsPerPage: 6,
          streetNumber,
          streetName,
          neighborhood,
          city
        }}
        onResultsChange={setResultsCount}
        onLoadingChange={handleLoadingChange}
      />
    </BuildingSectionContainer>
  )
}
