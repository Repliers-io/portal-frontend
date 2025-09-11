'use client'

import { useState } from 'react'
import { type Feature, type MultiLineString, type Position } from 'geojson'
import { type LngLatLike } from 'mapbox-gl'

import ExploreIcon from '@mui/icons-material/Explore'
import { Box, Button, Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'
import { simplify } from '@turf/turf'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood
} from 'services/API'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { getDefaultBounds, getLngLatCenter, getMapUrl } from 'utils/map'

import { Breadcrumbs } from '..'

import { CatalogMap, SeoDescription } from './components'

const CatalogHeader = ({
  count,
  area,
  city,
  hood,
  areas,
  cities,
  hoods,
  location
}: {
  count: number
  area?: string
  city?: string
  hood?: string
  areas: ApiBoardArea[]
  cities: ApiBoardCity[]
  hoods: ApiNeighborhood[]
  location?: ApiBoardCity | ApiNeighborhood
}) => {
  const {
    position: { bounds }
  } = useMapOptions()
  const defaultCenter = getLngLatCenter(bounds || getDefaultBounds())

  const [center, setCenter] = useState<LngLatLike | null>(defaultCenter)
  const [coordinates, setCoordinates] = useState<Position[][] | null>(null)

  const current = [defaultLocation.state, city, hood].filter(Boolean).at(-1)

  const mapLink = getMapUrl({ center: defaultCenter, zoom: 10 }) // WARN: temporary zoom level, calculate a new value based on bounds

  const handleLinkFocus = (item: ApiNeighborhood | ApiBoardCity) => {
    if (!item.coordinates || !item.coordinates?.length) {
      setCenter(item.location)
    } else {
      const line: Feature<MultiLineString> = {
        type: 'Feature',
        geometry: {
          type: 'MultiLineString',
          coordinates: item.coordinates!
        },
        properties: {}
      }

      const tolerance = 0.001 // Adjust the tolerance level to suit your needs
      const highQuality = false // Set to true for high-quality simplification (slower)
      const simplified = simplify(line, { tolerance, highQuality })
      const simplifiedCoords = simplified.geometry.coordinates
      setCoordinates(simplifiedCoords)
    }
  }

  const handleLinkBlur = () => {
    setCoordinates(null)
    setCenter(null)
  }

  return (
    <Box p={{ xs: 2, sm: 3 }} borderRadius={2} bgcolor="background.default">
      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
        <Stack spacing={{ xs: 0, sm: 1 }} width="100%">
          <Box sx={{ clear: 'both' }}>
            <Button
              href={mapLink}
              target="_blank"
              endIcon={<ExploreIcon />}
              sx={{
                ml: 2,
                mb: -1,
                mr: { xs: -1, md: 0 },
                float: 'right',
                height: '38px',
                whiteSpace: 'nowrap'
              }}
            >
              Explore
            </Button>
            <Typography variant="h2">
              {current}{' '}
              <span style={{ whiteSpace: 'nowrap' }}>Real Estate</span>
            </Typography>
          </Box>

          <Breadcrumbs area={area} city={city} hood={hood} />

          <SeoDescription
            count={count}
            area={area}
            city={city}
            hood={hood}
            areas={areas}
            cities={cities}
            hoods={hoods}
            location={location}
            onLinkFocus={handleLinkFocus}
            onLinkBlur={handleLinkBlur}
          />
        </Stack>

        <CatalogMap coordinates={coordinates} center={center} />
      </Stack>
    </Box>
  )
}

export default CatalogHeader
