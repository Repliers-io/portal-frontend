'use client'

import { useBuilding } from 'providers/BuildingProvider'

import { BuildingMap } from './BuildingMap'

export const CmsBuildingMap = () => {
  const { map, gallery } = useBuilding()

  // In image+map header mode (< 2 gallery images), map is shown in header, not as a section
  if (gallery.length < 2) return null

  return (
    <BuildingMap
      id="location"
      lat={map?.lat}
      lng={map?.lng}
      zoom={map?.zoom}
      title={map?.address}
      description={map?.description}
    />
  )
}
