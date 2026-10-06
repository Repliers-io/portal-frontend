import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { NavigationOutlinedIcon } from '@configs/icons'
import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearchActions } from 'providers/SearchProvider'
import useSnackbar from 'hooks/useSnackbar'

import { MapControlButton } from './MapControlButton'

const { mapFlyCurve, zoom } = mapConfig

// Centers the map on the device GPS position and drops the address point pin
// there — the same setPoint + flyTo the autosuggest runs when selecting an
// address. The active usePoint() in MapRoot renders the pin from the point.
export const MapLocateButton = () => {
  const t = useTranslations('Map')
  const { mapRef } = useMapOptions()
  const { setPoint } = useSearchActions()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  // Hide the control once geolocation permission is denied — it is a dead control
  // until the user re-enables it in the browser. Tracking the Permissions API also
  // hides it for a visitor who blocked location on an earlier visit, and brings it
  // back if they re-grant it.
  useEffect(() => {
    const permissions: Permissions | undefined = navigator.permissions
    if (!permissions?.query) return

    let status: PermissionStatus | null = null
    const sync = () => setDenied(status?.state === 'denied')

    permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        status = result
        sync()
        result.addEventListener('change', sync)
      })
      .catch(() => {
        // Permissions API can reject for the geolocation name on older browsers;
        // fall back to hiding at click time on PERMISSION_DENIED.
      })

    return () => status?.removeEventListener('change', sync)
  }, [])

  const map = mapRef.current

  const locate = () => {
    if (loading) return
    if (!map) return

    if (!navigator.geolocation) {
      showSnackbar(t('geolocationUnavailable'), 'error')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setPoint({ center: [latitude, longitude], label: t('myLocation') })
        map.flyTo({
          center: [longitude, latitude],
          zoom: zoom.address,
          ...mapFlyCurve
        })
        setLoading(false)
      },
      (error) => {
        const permissionDenied = error.code === error.PERMISSION_DENIED
        if (permissionDenied) setDenied(true)
        showSnackbar(
          t(permissionDenied ? 'geolocationDenied' : 'geolocationUnavailable'),
          'error'
        )
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (denied) return null

  return (
    <MapControlButton
      title={t('locate')}
      loading={loading}
      disabled={!map}
      onClick={locate}
    >
      <NavigationOutlinedIcon sx={{ fontSize: 20 }} />
    </MapControlButton>
  )
}
