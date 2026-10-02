'use client'

import React from 'react'

import { Stack } from '@mui/material'

import { useBuilding } from 'providers/BuildingProvider'

import {
  BuildingAmenities,
  BuildingFAQ,
  BuildingHeaderInfo,
  BuildingListings,
  BuildingReviews,
  BuildingSections,
  BuildingSoldListings,
  BuildingSpecs,
  CmsBuildingMap
} from '.'

export const BuildingMainContent = () => {
  const building = useBuilding()

  // Use the raw API building for listings queries (structured address).
  // For CMS-only buildings without API match, construct a minimal building
  // from the map address for listings to attempt a query.
  const listingsBuilding = building.apiBuilding || {
    address: building.address
  }

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      <BuildingHeaderInfo />

      <BuildingSpecs />

      <BuildingAmenities />

      <BuildingListings building={listingsBuilding as any} />

      <CmsBuildingMap />

      <BuildingFAQ />

      <BuildingReviews />

      <BuildingSections />

      <BuildingSoldListings building={listingsBuilding as any} />
    </Stack>
  )
}
