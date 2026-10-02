import React from 'react'

// import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material'

import features from '@configs/features'
import {
  ForumOutlinedIcon,
  MapIcon,
  ViewModuleRoundedIcon
} from '@configs/icons'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'

export const MapLayoutSwitch = ({
  variant = 'default'
}: {
  variant?: 'default' | 'widget'
}) => {
  const clientSide = useClientSide()
  const { layout, setLayout } = useMapOptions()

  const showChat = features.aiChat && variant !== 'widget'

  const handleChange = (
    _e: React.MouseEvent<HTMLElement>,
    value: typeof layout
  ) => {
    if (value) setLayout(value)
  }

  const groupWidth = showChat ? 158 : 107

  if (!clientSide) {
    return <Skeleton variant="rounded" sx={{ width: groupWidth, height: 38 }} />
  }

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={layout}
      onChange={handleChange}
      sx={{
        maxHeight: 38,
        width: groupWidth,
        '& .MuiToggleButton-root': { px: 2 }
      }}
    >
      {showChat && (
        <ToggleButton value="chat">
          <ForumOutlinedIcon sx={{ fontSize: 20 }} />
        </ToggleButton>
      )}
      <ToggleButton value="map">
        <MapIcon />
      </ToggleButton>
      <ToggleButton value="grid">
        <ViewModuleRoundedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
