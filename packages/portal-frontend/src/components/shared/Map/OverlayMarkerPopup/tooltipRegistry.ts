import type { GeoJsonProperties } from 'geojson'
import type { ComponentType } from 'react'

import { LiveByDistrictCard } from './LiveByDistrictCard'
import { LiveByNeighborhoodCard } from './LiveByNeighborhoodCard'
import { LiveByPostalCodeCard } from './LiveByPostalCodeCard'
import { LiveBySchoolCard } from './LiveBySchoolCard'
import { LiveBySchoolDistrictCard } from './LiveBySchoolDistrictCard'
import { ParcelCard } from './ParcelCard'

export type TooltipProps<P extends GeoJsonProperties = GeoJsonProperties> = {
  properties: P
}

/**
 * Maps OverlayLayerDefinition['id'] → tooltip component.
 * Override this file via _<tenant>/tooltipRegistry.tsx to register tenant-specific tooltips.
 */
const tooltipRegistry: Record<string, ComponentType<TooltipProps>> = {
  livebyDistrict: LiveByDistrictCard,
  livebyNeighborhood: LiveByNeighborhoodCard,
  livebyPostalCode: LiveByPostalCodeCard,
  livebySchool: LiveBySchoolCard,
  livebySchoolDistrict: LiveBySchoolDistrictCard,
  parcels: ParcelCard
}

export default tooltipRegistry
