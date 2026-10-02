import { useTranslations } from 'next-intl'

import { Button, ButtonGroup } from '@mui/material'

import { AddIcon, RemoveIcon } from '@configs/icons'
import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'

const { colors } = mapConfig.controls

export const MapNavigation = ({ disabled = false }: { disabled?: boolean }) => {
  const t = useTranslations('Map')
  const { mapRef, position } = useMapOptions()
  const map = mapRef.current

  const zoomIn = () => map?.zoomIn()
  const zoomOut = () => map?.zoomOut()

  const atMin = disabled || !map || position.zoom <= map.getMinZoom()
  const atMax = disabled || !map || position.zoom >= map.getMaxZoom()

  return (
    <ButtonGroup
      size="small"
      orientation="vertical"
      sx={{
        boxShadow: 1,
        display: { xs: 'none', sm: 'inline-flex' },
        backdropFilter: 'blur(4px)',
        bgcolor: colors.bg,
        // `&&` outranks the theme's Button variant styles and the group's own
        // grouped-button rules.
        '&& .MuiButton-root': {
          minWidth: 0,
          p: 0.75,
          color: colors.icon,
          ...(colors.hoverBg && {
            '&:hover': { bgcolor: colors.hoverBg }
          })
        },
        '&& .MuiButton-root.Mui-disabled': {
          color: colors.disabledIcon ?? 'action.disabled',
          // The group already paints `bg` behind both halves — repaint a half
          // only when the palette really separates the disabled surface.
          ...(colors.disabledBg !== colors.bg && {
            bgcolor: colors.disabledBg
          })
        },
        '& .MuiButtonGroup-groupedVertical.MuiButtonGroup-firstButton': {
          '&::after': {
            display: 'none'
          }
        }
      }}
    >
      <Button disabled={atMax} onClick={zoomIn} aria-label={t('zoomIn')}>
        <AddIcon sx={{ fontSize: 24 }} />
      </Button>
      <Button disabled={atMin} onClick={zoomOut} aria-label={t('zoomOut')}>
        <RemoveIcon sx={{ fontSize: 24 }} />
      </Button>
    </ButtonGroup>
  )
}
