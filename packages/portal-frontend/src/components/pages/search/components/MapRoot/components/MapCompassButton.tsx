import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Fade } from '@mui/material'

import { error, hint, info } from '@configs/colors'
import mapConfig from '@configs/map'
import { MapControlButton } from '@shared/Map'

import { useMapOptions } from 'providers/MapOptionsProvider'

import { resetMapRotation } from '../utils-3d'

const arrowWidth = 4
const arrowHeight = 9
const compassMargin = 5
const compassColor = hint
const northColor = info // 'blue'
const southColor = error // 'red'

export const MapCompassButton = () => {
  const t = useTranslations('Map')
  const [bearing, setBearing] = useState(0)
  const { mapRef, mode3D } = useMapOptions()
  const map = mapRef.current
  const resetRotation = t('resetRotation')

  // Get compass configuration
  const {
    controls: { compass },
    map3D: { rotationEnabledIn2D }
  } = mapConfig

  useEffect(() => {
    if (!map) return

    const updateBearing = () => {
      setBearing(Math.round(map.getBearing()))
    }

    // Set initial bearing
    updateBearing()

    // Listen for rotation changes
    map.on('rotate', updateBearing)

    return () => {
      map.off('rotate', updateBearing)
    }
  }, [map])

  // Don't render if compass is disabled completely
  if (!compass) {
    return null
  }

  const handleClick = () => {
    if (!map) return
    resetMapRotation(map)
  }

  // Check if rotation is available in current mode
  const rotationAvailable = mode3D || rotationEnabledIn2D

  // For dynamic mode, show only if bearing is not 0 AND rotation is available
  // For static mode, show only if rotation is available
  const visible = rotationAvailable && (compass === 'static' || bearing !== 0)

  // Unmounted while hidden so the control keeps no slot in the controls stack;
  // `Fade` still plays the fade-in on mount and the fade-out before removal.
  return (
    <Fade in={visible} timeout={300} unmountOnExit>
      <MapControlButton
        title={resetRotation}
        disabled={!map}
        onClick={handleClick}
      >
        <Box
          sx={{
            position: 'absolute',
            top: compassMargin,
            left: compassMargin,
            right: compassMargin,
            bottom: compassMargin,
            border: `2px dotted ${compassColor}`,
            borderRadius: '50%'
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              top: '50%',
              left: '50%',
              position: 'absolute',
              willChange: 'transform',
              transform: `rotateZ(${-bearing}deg)`
            }}
          >
            <Box
              sx={{
                width: 0,
                height: 0,
                top: -arrowHeight,
                left: -arrowWidth,
                position: 'absolute',
                borderLeft: `${arrowWidth}px solid transparent`,
                borderRight: `${arrowWidth}px solid transparent`,
                borderBottom: `${arrowHeight}px solid ${northColor}`
              }}
            />
            <Box
              sx={{
                width: 0,
                height: 0,
                bottom: -arrowHeight,
                left: -arrowWidth,
                position: 'absolute',
                borderLeft: `${arrowWidth}px solid transparent`,
                borderRight: `${arrowWidth}px solid transparent`,
                borderTop: `${arrowHeight}px solid ${southColor}`
              }}
            />
          </Box>
        </Box>
      </MapControlButton>
    </Fade>
  )
}
