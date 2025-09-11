import type { EstimateListingType } from '@configs/estimate'
import { TYPE_CONDO, TYPE_RESIDENTIAL } from '@configs/filter-types'

import type { ApiAddress } from 'services/API'
import { type Property } from 'services/API'
import { joinNonEmpty } from 'utils/strings'

export const formatAddress = (option: ApiAddress | null) => {
  const optionLabel = joinNonEmpty([option?.address, option?.city], ', ')
  return optionLabel
}

export const getPropertyMock = (listingType: EstimateListingType) => {
  const propertyType =
    listingType === 'condo' ? TYPE_CONDO[0] : TYPE_RESIDENTIAL[0]
  const propertyMock = { details: { propertyType } } as Property
  return propertyMock
}
