import { useTranslations } from 'next-intl'

import { CircularProgress } from '@mui/material'

import { SignpostOutlinedIcon } from '@configs/icons'
import { useMapTitleVisible } from '@shared/Map/hooks'

import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { formatPointString } from 'utils/formatters'
import { getPointBounds } from 'utils/map'

import { MapCenterButton } from '../MapCenterButton'
import { SelectedLocations } from '../SelectedLocations'

import { MapTitleBar, MapTitleContent } from './components'

export const MapTitle = () => {
  // the component could show several types of titles:
  // simple `string` message to display,
  // the selected `locations` (stored in MapOptionsProvider),
  // a `point` (stored in SearchProvider) — a radius point shows the search area,
  // a radius-less address point shows its label/coordinates.

  const { mapRef, title, titleBounds, titleLoading } = useMapOptions()
  const { locations, locationBounds } = useMapLocations()
  const t = useTranslations()
  const { point } = useSearch()

  const radiusPoint = point?.radius != null
  const addressPoint = !!point && point.radius == null

  const visible = useMapTitleVisible()
  const bounds = point ? getPointBounds(point) : locationBounds
  const locationString = point && radiusPoint ? formatPointString(point) : ' '

  return (
    <MapTitleBar visible={visible}>
      {radiusPoint || locations ? (
        <MapTitleContent
          title={t('Map.showingListingsIn', { location: locationString })}
        >
          {locations && <SelectedLocations locations={locations} />}
          <MapCenterButton mapRef={mapRef} bounds={bounds} />
        </MapTitleContent>
      ) : addressPoint ? (
        <MapTitleContent
          title={
            point!.label
              ? `${point!.label} ${formatPointString(point!)}`
              : formatPointString(point!)
          }
          icon={
            <SignpostOutlinedIcon
              sx={{ fontSize: 20, color: 'text.secondary' }}
            />
          }
        >
          <MapCenterButton mapRef={mapRef} bounds={bounds} />
        </MapTitleContent>
      ) : (
        <MapTitleContent title={title}>
          {titleBounds && (
            <MapCenterButton mapRef={mapRef} bounds={titleBounds} />
          )}
        </MapTitleContent>
      )}
      {titleLoading && <CircularProgress size={16} />}
    </MapTitleBar>
  )
}
