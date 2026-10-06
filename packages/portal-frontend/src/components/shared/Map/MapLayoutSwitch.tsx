import React from 'react'
import { useTranslations } from 'next-intl'

import {
  alpha,
  Button,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

import { primary } from '@configs/colors'
import features from '@configs/features'
import {
  ForumOutlinedIcon,
  MapIcon,
  ViewModuleRoundedIcon
} from '@configs/icons'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'

import { floatingGroupSx } from './MapStyleSwitch'

// Translucent chrome of the single button floating over the map on phones and tablets
const floatingSx = {
  backdropFilter: 'blur(8px)',
  bgcolor: alpha(primary, 0.8),
  // `&&` outranks the theme's `disableElevation`
  '&&': { boxShadow: 1 }
}

export const MapLayoutSwitch = ({
  variant = 'default'
}: {
  variant?: 'default' | 'widget' | 'floating'
}) => {
  const t = useTranslations('MapFilters')
  const clientSide = useClientSide()
  const { layout, setLayout } = useMapOptions()

  const showChat = features.aiChat && variant !== 'widget'
  const floating = variant === 'floating'

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

  // Without the chat a floating two-way switch is a single button naming the other layout
  if (floating && !showChat) {
    const onMap = layout === 'map'
    return (
      <Button
        size="small"
        variant="contained"
        onClick={() => setLayout(onMap ? 'grid' : 'map')}
        sx={{ width: 120, ...floatingSx }}
      >
        {t(onMap ? 'layoutList' : 'layoutMap')}
      </Button>
    )
  }

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={layout}
      onChange={handleChange}
      sx={[
        {
          maxHeight: 38,
          width: groupWidth,
          '& .MuiToggleButton-root': { px: 2 }
        },
        floating && floatingGroupSx
      ]}
    >
      {showChat && (
        <ToggleButton value="chat" aria-label={t('layoutChat')}>
          <ForumOutlinedIcon sx={{ fontSize: 20 }} />
        </ToggleButton>
      )}
      <ToggleButton value="map" aria-label={t('layoutMap')}>
        <MapIcon />
      </ToggleButton>
      <ToggleButton value="grid" aria-label={t('layoutList')}>
        <ViewModuleRoundedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
