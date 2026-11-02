import content from '@configs/content'
import locationConfig from '@configs/location'

import { locationMatchKey } from 'services/LocationsTree/filters'
import { scrubbed } from 'utils/formatters'

export const excludedArea = (area?: string | null) =>
  Boolean(
    locationConfig.indexAreas.length &&
    area?.trim() &&
    !scrubbed(area) &&
    !locationConfig.indexAreas.some(
      (name) => locationMatchKey(name) === locationMatchKey(area)
    )
  )

export const areaMetadata = (area?: string | null) =>
  excludedArea(area)
    ? { robots: { index: false, follow: !content.noIndex } }
    : {}
