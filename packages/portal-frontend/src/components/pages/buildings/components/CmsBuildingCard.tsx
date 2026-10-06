'use client'

import routes from '@configs/routes'
import { BuildingCard } from '@shared/BuildingCard'

import { type WpMediaItem } from 'services/CMS/clients/WordPressClient/types'

type CmsBuildingCardProps = {
  building: {
    id: number
    name: string
    slug: string
    link?: string
    acf?: {
      slideshow?: number[]
      map?: {
        address?: string
      }
    }
    _media?: WpMediaItem
  }
  media?: WpMediaItem | null
}

export const CmsBuildingCard = ({ building, media }: CmsBuildingCardProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CMS media shape is untyped
  const m = (media ?? building._media ?? null) as Record<string, any> | null

  const imageUrl: string | undefined =
    m?.media_details?.sizes?.medium?.source_url ||
    m?.media_details?.sizes?.medium_large?.source_url ||
    m?.source_url

  const href = building.link
    ? routes.building + new URL(building.link).pathname
    : `${routes.building}/${building.slug}`

  return (
    <BuildingCard
      name={building.name}
      address={building.acf?.map?.address}
      href={href}
      imageUrl={imageUrl}
      source="cms"
    />
  )
}
