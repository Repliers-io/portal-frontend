import React from 'react'

import { alpha, Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

import { primary } from '@configs/colors'
import {
  ForestOutlinedIcon,
  PublicIcon,
  SignpostOutlinedIcon
} from '@configs/icons'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'
import { capitalize } from 'utils/strings'

type MapStyle = 'map' | 'hybrid' | 'satellite'
type MapStyleButtonProps = [name: MapStyle, icon: React.ReactElement]

// Translucent chrome of a toggle group floating over the map
export const floatingGroupSx = {
  boxShadow: 1,
  backdropFilter: 'blur(4px)',
  bgcolor: alpha('#FFFFFF', 0.7),
  '& .MuiToggleButton-root.Mui-selected': {
    bgcolor: alpha(primary, 0.8)
  },
  // a tap leaves :hover on the segment, where the theme's opaque `primary.dark`
  // wins the specificity tie with the rule above
  '@media (hover: none)': {
    '& .MuiToggleButton-root.Mui-selected:hover': {
      bgcolor: alpha(primary, 0.8)
    }
  }
}

export const MapStyleSwitch = () => {
  const clientSide = useClientSide()
  const { style, setStyle } = useMapOptions()

  const buttons: MapStyleButtonProps[] = [
    ['satellite', <PublicIcon sx={{ fontSize: 18 }} key="satellite" />],
    ['hybrid', <SignpostOutlinedIcon sx={{ fontSize: 20 }} key="hybrid" />],
    // the vector style shows the same tree as the map's loading placeholder
    ['map', <ForestOutlinedIcon sx={{ fontSize: 19 }} key="map" />]
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
          ...floatingGroupSx,
          flexShrink: 0,
          minWidth: 'max-content',
          '& .MuiToggleButton-root': {
            px: 2,
            fontWeight: 400,
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
