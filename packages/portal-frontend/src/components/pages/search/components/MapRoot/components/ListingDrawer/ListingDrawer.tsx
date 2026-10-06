import { useEffect, useRef, useState } from 'react'
import { type Map as MapboxMap } from 'mapbox-gl'

import { Box, Drawer } from '@mui/material'

import { CardSurface, DrawerListingCard } from '@shared/Listing'

import { type ApiListing } from 'services/API'
import { formatShortAddress } from 'utils/listings'

import { DrawerCloseButton, MultiUnitsBar } from './components'

export const ListingDrawer = ({
  map,
  listing,
  multiUnits,
  onClose
}: {
  map: MapboxMap | null
  listing: ApiListing | null
  multiUnits: ApiListing[]
  onClose?: () => void
}) => {
  const [open, setOpen] = useState(!!listing)
  const [currentMultiUnit, setCurrentMultiUnit] = useState(0)
  const [loading, setLoading] = useState(false)
  const lastListingRef = useRef<ApiListing | null>(listing)

  if (listing) lastListingRef.current = listing

  const handleDrawerClose = () => {
    onClose?.()
    setOpen(false)
    setCurrentMultiUnit(0)
  }

  useEffect(() => {
    if (listing) {
      setOpen(true)
      setLoading(false)
    }
  }, [listing])

  useEffect(() => {
    if (!map) return

    const handleUserMove = (e: { originalEvent?: Event }) => {
      if (e.originalEvent) requestAnimationFrame(handleDrawerClose)
      else if (lastListingRef.current) setLoading(true)
    }

    map.on('movestart', handleUserMove)
    return () => {
      map.off('movestart', handleUserMove)
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

  const activeListing = currentMultiUnit
    ? multiUnits[currentMultiUnit]
    : (listing ?? lastListingRef.current)

  // Non-modal peek drawer: the map stays interactive behind it (moving the map
  // closes it), so it is a named dialog WITHOUT `aria-modal` — the address names it.
  const label = activeListing
    ? formatShortAddress(activeListing.address)
    : undefined

  return (
    <Drawer
      open={open}
      hideBackdrop
      elevation={2}
      anchor="bottom"
      disableScrollLock
      onClose={handleDrawerClose}
      slotProps={{ paper: { role: 'dialog', 'aria-label': label } }}
      ModalProps={{
        keepMounted: true,
        disablePortal: true,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true
      }}
      sx={{
        top: 'auto',
        zIndex: 'drawer',
        '& .MuiDrawer-paper': {
          borderRadius: 0,
          overflow: 'visible',
          willChange: 'transform',
          bgcolor: 'background.paper'
        }
      }}
    >
      <CardSurface surface="map">
        <Box sx={{ position: 'relative' }}>
          <DrawerCloseButton open={open} onClose={handleDrawerClose} />
          {activeListing && (
            <Box
              sx={{
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.15s linear'
              }}
            >
              <DrawerListingCard listing={activeListing} />
            </Box>
          )}
        </Box>
        {multiUnits.length > 0 && (
          <MultiUnitsBar
            current={currentMultiUnit}
            total={multiUnits.length}
            onPrev={handlePrevClick}
            onNext={handleNextClick}
          />
        )}
      </CardSurface>
    </Drawer>
  )
}
