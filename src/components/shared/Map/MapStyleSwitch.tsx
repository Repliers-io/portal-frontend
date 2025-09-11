import React from 'react'

import DirectionsIcon from '@mui/icons-material/Directions'
import { alpha, Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import { primary } from '@configs/colors'
import { type MapStyle } from '@configs/map'
import IcoMap from '@icons/IcoMap'
import IcoSatellite from '@icons/IcoSatellite'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'
import { capitalize } from 'utils/strings'

type MapStyleButtonProps = [name: MapStyle, icon: React.ReactElement<any>]

const MapStyleSwitch = () => {
  const clientSide = useClientSide()
  const { style, setStyle } = useMapOptions()

  const buttons: MapStyleButtonProps[] = [
    ['satellite', <IcoSatellite size={18} key="satellite" color="" />],
    ['hybrid', <DirectionsIcon sx={{ fontSize: 20 }} key="hybrid" />],
    ['map', <IcoMap key="map" color="" />]
  ]

  const handleChange = (e: React.MouseEvent, value: MapStyle) => {
    if (!value) return
    setStyle(value)
  }

  return (
    <Box
      sx={{
        boxShadow: 1,
        borderRadius: 2,
        zIndex: 'fab',
        position: 'absolute',
        bottom: { xs: 32, sm: 16 },
        right: { xs: '50%', sm: 16 },
        mr: { xs: 0, sm: 0 },
        transform: { xs: 'translateX(50%)', sm: 'none' }
      }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={style}
        disabled={!clientSide}
        onChange={handleChange}
        fullWidth
        sx={{
          backdropFilter: 'blur(4px)',
          bgcolor: alpha('#FFFFFF', 0.7),
          '& .MuiToggleButton-root': {
            minWidth: { xs: 'auto', sm: 114 },
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

export default MapStyleSwitch
