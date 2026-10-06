'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { GridWidget } from '@shared/CmsWidgets'

import { type ApiBuilding } from 'services/API'
import { getBuildingLabel } from 'utils/buildings'

import { BuildingSectionContainer } from '.'

interface BuildingListingsProps {
  building: ApiBuilding
}

export const BuildingListings = ({ building }: BuildingListingsProps) => {
  const t = useTranslations('Building')
  const { address } = building
  const { streetNumber, streetName, city, neighborhood } = address || {}
  const [resultsCount, setResultsCount] = useState<number | null>(null)

  const label = getBuildingLabel(building)
  const title = label
    ? t('condosTitleAt', { building: label })
    : t('condosTitle')

  const handleLoadingChange = (loading: boolean) => {
    window.dispatchEvent(
      new CustomEvent('BuildingListings:loading', { detail: { loading } })
    )
  }

  // Hide section if there are no results (after loading)
  if (resultsCount === 0) return null

  return (
    <BuildingSectionContainer id="condos" title={title}>
      <GridWidget
        maxColumns={3}
        pagination={true}
        listings={{
          listingStatus: 'active',
          listingType: 'condo',
          sortBy: 'createdOnDesc',
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
