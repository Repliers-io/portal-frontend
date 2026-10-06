import { useTranslations } from 'next-intl'

import { ViewInArIcon } from '@configs/icons'
import mapConfig from '@configs/map'
import { MapControlButton } from '@shared/Map'

import { useMapOptions } from 'providers/MapOptionsProvider'

import { applyMapPitch, resetMapOrientation } from '../../utils-3d'

import { Map3DButtonTooltip } from './Map3DButtonTooltip'

export const Map3DButton = ({ desktopOnly = true }) => {
  const t = useTranslations()
  const { mapRef, mode3D, toggleMode3D } = useMapOptions()
  const map = mapRef?.current

  // Check if 3D features are enabled in config
  if (!mapConfig.map3D?.enabled) {
    return null
  }

  // Pre-activated 3D mode (URL) renders before the map is ready: while the
  // button is disabled keep the neutral background so the MUI-greyed icon
  // doesn't sit on the active dark fill
  const active = mode3D && Boolean(map)

  const handleToggle3D = () => {
    if (!map) return

    if (!mode3D) {
      applyMapPitch(map)
    } else {
      resetMapOrientation(map)
    }
    // Update global state first
    toggleMode3D()
  }

  return (
    <MapControlButton
      title={<Map3DButtonTooltip />}
      aria-label={t('Map.switchTo3DView')}
      desktopOnly={desktopOnly}
      active={active}
      disabled={!map}
      onClick={handleToggle3D}
    >
      <ViewInArIcon sx={{ fontSize: 20 }} />
    </MapControlButton>
  )
}
