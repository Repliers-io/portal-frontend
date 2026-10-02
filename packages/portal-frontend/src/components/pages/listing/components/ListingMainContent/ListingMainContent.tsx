'use client'

import React from 'react'

import { Stack } from '@mui/material'

import features from '@configs/features'
import { DetailsContainer } from '@shared/Containers'

import { useListing } from 'providers/ListingProvider'
import MapOptionsProvider from 'providers/MapOptionsProvider'
import ParcelProvider from 'providers/ParcelProvider'
import { displayOnMap } from 'utils/listings'

import {
  AppliancesDetails,
  CondominiumDetails,
  ExteriorDetails,
  FeaturesDetails,
  HistoryDetails,
  HomeDescription,
  HomeDetails,
  HomeHeaderInfo,
  ListingHomeMap,
  ListingParcelLayer,
  LiveByDemographics,
  NeighborhoodDetails,
  OpenHouseSection,
  ParcelFacts,
  RoomsDetails
} from './components'

export const ListingMainContent = ({
  mapType
}: {
  mapType: 'interactive' | 'static'
}) => {
  const { listing } = useListing()
  const showMap = displayOnMap(listing)

  return (
    <Stack spacing={4} sx={{ flex: 1, width: '100%' }}>
      <HomeHeaderInfo />

      <OpenHouseSection />

      <DetailsContainer>
        {/* One parcel lookup feeds both the polygon on the map and the facts below
            the details — the map's own provider wraps only the map. */}
        <ParcelProvider>
          <Stack spacing={{ xs: 3, sm: 4 }}>
            <HomeDescription />

            {showMap &&
              (mapType === 'static' ? (
                <ListingHomeMap type={mapType} />
              ) : (
                <MapOptionsProvider layout="map" style="hybrid">
                  <ListingHomeMap />
                  <ListingParcelLayer />
                </MapOptionsProvider>
              ))}
            <HomeDetails />
            <ParcelFacts />
          </Stack>
        </ParcelProvider>
      </DetailsContainer>

      <FeaturesDetails />

      <AppliancesDetails />

      <ExteriorDetails />

      <CondominiumDetails />

      <RoomsDetails />

      <NeighborhoodDetails />

      {features.liveBy && <LiveByDemographics visibleCount={3} />}

      <HistoryDetails />
    </Stack>
  )
}
