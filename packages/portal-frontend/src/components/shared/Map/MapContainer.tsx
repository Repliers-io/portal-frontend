import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, type BoxProps, Typography } from '@mui/material'

import { webglSupported } from 'utils/map'

import 'mapbox-gl/dist/mapbox-gl.css'

import { MapBackdropIcon } from './MapBackdropIcon'

type MapContainerProps = BoxProps & {
  loading?: boolean
}

// Mapbox requires the map container to be empty on init, so the loading
// backdrop is rendered as a sibling overlay, not a child of the ref'd element.
export const MapContainer = React.forwardRef<HTMLDivElement, MapContainerProps>(
  ({ loading, ...props }, ref) => {
    const t = useTranslations('Map')
    // Probed after mount — the check needs `document`, and starting at false
    // keeps server and first client render identical.
    const [webglError, setWebglError] = useState(false)

    useEffect(() => {
      setWebglError(!webglSupported())
    }, [])

    return (
      <>
        <Box
          {...props}
          ref={ref}
          sx={{
            inset: 0,
            bgcolor: '#e9e6e0',
            overflow: 'hidden',
            position: 'absolute',
            contentVisibility: 'visible',
            '& .active': {
              zIndex: 1000
            },
            '& .mapboxgl-canvas': {
              outline: 'none !important'
            },
            '& .mapboxgl-popup': {
              zIndex: 1000
            },
            '& .lm--overlay': {
              zIndex: 5
            },
            // The selected point marker sits above listings (and overlays).
            '& .lm--point': {
              zIndex: 6
            },
            '& .mapboxgl-marker:hover, & .mapboxgl-marker:has(.active)': {
              zIndex: 1000
            },
            '& .mapboxgl-popup-content': {
              p: 0,
              boxShadow: 0,
              bgcolor: 'transparent !important'
            },
            // The listing hover card stays mounted over the map, so it must never
            // intercept hover from the markers underneath it — it is a pure preview.
            // `!important`: in globe projection Mapbox's Popup._setOpacity writes an
            // inline `pointer-events: auto` on the content and never clears it.
            '& .listing-hover-popup .mapboxgl-popup-content': {
              pointerEvents: 'none !important'
            },
            '& .mapboxgl-popup-tip': {
              display: 'none !important'
            },
            '& .mapboxgl-ctrl-group': {
              display: { xs: 'none', md: 'block' }
            }
          }}
        />
        {webglError ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              top: '50%',
              left: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              pointerEvents: 'none',
              textAlign: 'center',
              width: 'min(320px, 80%)'
            }}
          >
            {t('webglUnavailable')}
          </Typography>
        ) : (
          loading && <MapBackdropIcon />
        )}
      </>
    )
  }
)

MapContainer.displayName = 'MapContainer'
