import React from 'react'
import Link from 'next/link'

import { IconButton, Stack } from '@mui/material'

import { AddIcon, RemoveIcon } from '@configs/icons'
import mapConfig from '@configs/map'
import { overlayForLocation } from '@shared/Map/hooks'

import { type ApiCoords, type ApiLocation } from 'services/API'
import { useMapLocations } from 'providers/MapOptionsProvider'
import { getMapUrl, toMapboxPoint } from 'utils/map'

import { getLocationLabel } from '../utils'

import { OptionItem } from '.'

const { zoom } = mapConfig

export const OptionLocation = ({
  props,
  option,
  onAdd,
  onRemove
}: {
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }
  option: ApiLocation
  onAdd?: (location: ApiLocation) => void
  onRemove?: (location: ApiLocation) => void
}) => {
  const { key, ...otherProps } = props

  const { locations } = useMapLocations()
  const hasLocations = !!locations && locations?.length > 0
  const thisLocation = locations?.some(
    (loc) => loc.locationId === option.locationId
  )

  const showAddButton = hasLocations && !thisLocation
  const showRemoveButton = hasLocations && thisLocation

  // `layers` enables the overlay rendering this location type, so the
  // destination map draws the selected polygon, not just the filter
  const overlay = overlayForLocation(mapConfig.overlays.layers, option.type)
  const locationUrl = getMapUrl({
    zoom: zoom.area,
    center: toMapboxPoint(option.map as ApiCoords),
    location: option,
    layers: overlay ? [overlay.id] : undefined
  })

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAdd?.(option)
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove?.(option)
  }

  return (
    <OptionItem key={key} {...otherProps}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Link
          href={locationUrl}
          onClick={(e) => {
            e.preventDefault()
          }}
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {getLocationLabel(option)}
        </Link>

        {showAddButton && (
          <IconButton
            size="small"
            color="primary"
            onClick={handleAddClick}
            sx={{
              my: -1,
              width: 30,
              height: 30,
              flexShrink: 0,
              bgcolor: 'background.paper',

              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white'
              }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}

        {showRemoveButton && (
          <IconButton
            size="small"
            color="primary"
            onClick={handleRemoveClick}
            sx={{
              my: -1,
              width: 30,
              height: 30,
              flexShrink: 0,
              bgcolor: 'background.paper',

              '&:hover': {
                bgcolor: 'error.light',
                color: 'white'
              }
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </OptionItem>
  )
}
