import React from 'react'

import { alpha, Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import { primary } from '@configs/colors'
import { DirectionsIcon, MapIcon, PublicIcon } from '@configs/icons'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'
import { capitalize } from 'utils/strings'

type MapStyle = 'map' | 'hybrid' | 'satellite'
type MapStyleButtonProps = [name: MapStyle, icon: React.ReactElement]

export const MapStyleSwitch = () => {
  const clientSide = useClientSide()
  const { style, setStyle } = useMapOptions()

  const buttons: MapStyleButtonProps[] = [
    ['satellite', <PublicIcon sx={{ fontSize: 18 }} key="satellite" />],
    ['hybrid', <DirectionsIcon sx={{ fontSize: 20 }} key="hybrid" />],
    ['map', <MapIcon key="map" color="" />]
  ]

  const handleChange = (e: React.MouseEvent, value: MapStyle) => {
    if (!value) return
    setStyle(value)
  }

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={style}
        disabled={!clientSide}
        onChange={handleChange}
        sx={{
          flexShrink: 0,
          minWidth: 'max-content',
          boxShadow: 1,
          backdropFilter: 'blur(4px)',
          bgcolor: alpha('#FFFFFF', 0.7),
          '& .MuiToggleButton-root': {
            px: 2,
            fontWeight: 400,
            '&.Mui-selected': {
              bgcolor: alpha(primary, 0.8)
            },
            '&.Mui-disabled': {
              border: 0
            }
          }
        }}
      >
        {buttons.map(([name, icon]) => (
          <ToggleButton key={name} value={name}>
            {icon}
            <Box component="span" pl={1}>
              {capitalize(name)}
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}
