'use client'

import { BuildingCard } from '@shared/BuildingCard'

import { type EnrichedBuilding } from 'app/condos/_utils'

import { getBuildingName } from 'utils/buildings'
import { getCDNPath } from 'utils/urls'

import { getBuildingSubtitle, getBuildingUrl } from '../utils'

type LocBuildingCardProps = {
  building: EnrichedBuilding
  area?: string
  city?: string
  hood?: string
}

export const LocBuildingCard = ({
  building,
  area: propArea,
  city: propCity,
  hood: propHood
}: LocBuildingCardProps) => {
  const { address } = building

  const { streetNumber, streetName } = address || {}
  const streetAddress = [streetNumber, streetName].filter(Boolean).join(' ')

  const properName = getBuildingName(building)
  const hasName = Boolean(properName)
  const displayName = hasName ? properName! : streetAddress

  const displayAddress = getBuildingSubtitle(address, hasName)

  const href = getBuildingUrl(building, {
    area: propArea,
    city: propCity,
    hood: propHood
  })

  const imageUrl =
    building.cmsImageUrl ??
    (building.image ? getCDNPath(building.image, 'medium') : undefined)

  return (
    <BuildingCard
      name={displayName}
      address={displayAddress}
      href={href}
      imageUrl={imageUrl}
      source={building.source}
    />
  )
}
