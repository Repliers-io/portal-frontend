import React, { useEffect, useState } from 'react'
import { type Map as MapboxMap } from 'mapbox-gl'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material'

import { PropertyCard } from '@shared/Property'

import { type Property } from 'services/API'

const PropertyDrawer = ({
  map,
  property,
  multiUnits
}: {
  map: MapboxMap | null
  property: Property | null
  multiUnits: Property[]
}) => {
  const [open, setOpen] = useState(!!property)
  const [currentMultiUnit, setCurrentMultiUnit] = useState(0)

  const handleDrawerClose = () => {
    setOpen(false)
    setCurrentMultiUnit(0)
  }

  useEffect(() => {
    if (property) {
      // roll out old drawer and slide it in with new PropertyCard
      setOpen(true)
    }
  }, [property])

  useEffect(() => {
    if (map && !open) {
      map.on('dragstart', handleDrawerClose)
      map.on('zoomstart', handleDrawerClose)
    }
  }, [map])

  const handlePrevClick = () => {
    setCurrentMultiUnit((prev) =>
      prev === 0 ? multiUnits.length - 1 : prev - 1
    )
  }

  const handleNextClick = () => {
    setCurrentMultiUnit((prev) =>
      prev === multiUnits.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <Drawer
      open={open}
      hideBackdrop
      elevation={2}
      anchor="bottom"
      disableScrollLock
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: true
      }}
      sx={{
        zIndex: 'drawer',
        top: 'auto',
        '& .MuiDrawer-paper': {
          borderRadius: '8px 8px 0 0',
          bgcolor: 'common.white'
        }
      }}
    >
      {property && (
        <PropertyCard
          size="drawer"
          property={currentMultiUnit ? multiUnits[currentMultiUnit] : property}
        />
      )}
      {multiUnits.length > 0 && (
        <Box sx={{ p: 1, color: 'common.white' }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton onClick={handlePrevClick}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Typography fontWeight="600">
              {currentMultiUnit + 1} of {multiUnits.length} listings
            </Typography>
            <IconButton onClick={handleNextClick}>
              <ArrowBackIosNewIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Stack>
        </Box>
      )}
    </Drawer>
  )
}

export default PropertyDrawer
