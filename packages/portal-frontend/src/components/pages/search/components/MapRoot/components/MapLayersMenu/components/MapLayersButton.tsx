import { type Ref } from 'react'
import { useTranslations } from 'next-intl'

import { lighten } from '@mui/material'

import { primary } from '@configs/colors'
import { LayersOutlinedIcon } from '@configs/icons'
import { MapControlButton } from '@shared/Map'

export type MapLayersButtonProps = {
  /** Anchor of the layers popover. */
  ref?: Ref<HTMLButtonElement>
  /** At least one overlay layer is active. */
  active: boolean
  /** The layers popover is open. */
  open: boolean
  /** An active layer is still fetching. */
  loading: boolean
  /** Active layer accent color — used by tenant forks that tint the button. */
  accent?: string
  disabled: boolean
  /** Every layer in the menu is blocked by an active search area — the trigger
   *  is disabled and its tooltip explains why instead of the default hint. */
  blocked?: boolean
  onClick: () => void
}

/**
 * Default presentation of the layers-menu trigger — a standard map-control
 * button (like MapDrawButton) with the neutral layers icon and a
 * primary active tint. Tenant-specific looks live in `_<tenant>/MapLayersButton`.
 * `accent` is part of the shared contract but unused here (the primary tint wins).
 */
export const MapLayersButton = ({
  ref,
  active,
  open,
  loading,
  disabled,
  blocked,
  onClick
}: MapLayersButtonProps) => {
  const t = useTranslations()
  const title = blocked
    ? t('Map.overlayDisabledWhilePolygon', {
        feature: t('Map.layersButtonTooltip')
      })
    : t('Map.layersButtonTooltip')

  return (
    <MapControlButton
      ref={ref}
      title={title}
      active={active}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      sx={[
        // Open with no active layer mimics a focused select field (2px border).
        // When a layer is active, the filled "selected" state wins — no border.
        open &&
          !active && {
            bgcolor: lighten(primary, 0.85),
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 'inherit',
              pointerEvents: 'none'
            }
          }
      ]}
    >
      <LayersOutlinedIcon sx={{ fontSize: 22 }} />
    </MapControlButton>
  )
}
