import sections from '@configs/pdp'

import {
  // type ListingLastStatus,
  // listingLastStatusMapping,
  type Property
} from 'services/API'

import { filterEmptyGroups } from '../../utils'
import createResolver from '../createResolver'

const { groups } = sections.home

// const isStatus = (label: DetailsItem) => {
//   return label.label === 'Status'
// }

// const isLeaseDate = (label: DetailsItem, type: string) => {
//   return label.label === 'Sold date' && type === 'Lease'
// }

// const transformLastStatus = (label: DetailsItem) => {
//   const status = label.value as ListingLastStatus
//   return {
//     label: label.label,
//     value: listingLastStatusMapping[status] || status
//   }
// }

// const transformLeaseDate = (label: DetailsItem) => {
//   return {
//     label: 'Lease date',
//     value: label.value
//   }
// }

// const processHomeSection = (
//   property: Property,
//   homeProperties: DetailsItem[]
// ) => {
//   const { type } = property

//   return homeProperties.map((item) => {
//     if (isLeaseDate(item, type)) {
//       return transformLeaseDate(item)
//     }

//     if (isStatus(item)) {
//       return transformLastStatus(item)
//     }

//     return item
//   })
// }

const homeResolver = (property: Property) => {
  try {
    const resolve = (items: any) => createResolver(items, property)
    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error('[homeResolver] error resolving section properties.', error)
    return []
  }
}

export default homeResolver
