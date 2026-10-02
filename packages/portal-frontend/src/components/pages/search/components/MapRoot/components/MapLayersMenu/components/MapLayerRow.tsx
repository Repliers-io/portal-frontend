import { useTranslations } from 'next-intl'

import { alpha, Box, FormControlLabel, Tooltip } from '@mui/material'

import { primary } from '@configs/colors'
import type { OverlayLayerDefinition } from '@defaults/map'
import { useOverlayToggle } from '@shared/Map/hooks'

import { AndroidSwitch } from 'components/atoms'

import { overlayAccent } from 'utils/map/overlays'

export type MapLayerRowProps = {
  layer: OverlayLayerDefinition
}

/**
 * Default layer row — a select-dropdown-item-style toggle: a full-width label and
 * AndroidSwitch with its own padding and a hover highlight. Layers with nested
 * `filterOptions` (movesmartly only) are handled by the `_movesmartly-com/` fork,
 * so the shared/default row stays a plain on/off switch.
 */
export const MapLayerRow = ({ layer }: MapLayerRowProps) => {
  const { active, toggle, blocked } = useOverlayToggle(layer)
  const t = useTranslations()

  return (
    <Tooltip
      title={
        blocked
          ? t('Map.overlayDisabledWhilePolygon', {
              feature: `Show ${String(layer.label).toLowerCase()} layer`
            })
          : ''
      }
      arrow
      placement="left"
    >
      <Box component="span" sx={{ display: 'block', width: '100%' }}>
        <FormControlLabel
          label={layer.label}
          labelPlacement="start"
          disabled={blocked}
          control={
            <AndroidSwitch
              checked={active}
              onChange={toggle}
              sx={{
                mr: -1,
                '& .MuiSwitch-colorPrimary.Mui-checked': {
                  color: overlayAccent(layer)
                },
                '& .MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: overlayAccent(layer)
                }
              }}
            />
          }
          sx={{
            mx: 0,
            py: 0,
            px: 2,
            gap: 1,
            width: '100%',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
            '&:hover': { bgcolor: alpha(primary, 0.08) }
          }}
        />
      </Box>
    </Tooltip>
  )
}
