import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { TonalityIcon } from '@configs/icons'
import { MapControlButton } from '@shared/Map'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'

export const ShadowsButton = () => {
  const t = useTranslations('Map')
  const clientSide = useClientSide()
  const {
    style,
    mode3D,
    position,
    shadows: active,
    toggleShadows,
    setShadows
  } = useMapOptions()

  const zoom = position?.zoom || 0

  const visible = clientSide && mode3D && style === 'map' && zoom >= 15

  // Auto-disable shadows when zoom >= 15
  useEffect(() => {
    if (zoom < 15 && active) setShadows(false)
  }, [zoom, active, setShadows])

  if (!visible) return null

  return (
    <MapControlButton
      title={active ? t('hideShadows') : t('showShadows')}
      active={active}
      onClick={toggleShadows}
    >
      <TonalityIcon sx={{ fontSize: 18 }} />
    </MapControlButton>
  )
}
