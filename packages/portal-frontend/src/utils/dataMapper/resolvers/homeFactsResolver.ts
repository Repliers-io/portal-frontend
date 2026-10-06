import { type EstimatePayload } from '@configs/estimate'
import { homeFactsFields } from '@configs/estimate/homeFacts'

import { type EstimateResolverItem, type ResolverItem } from '../types'
import { createResolver, isEmptyValue } from '../utils'

const visibleFields = (fields: EstimateResolverItem[], hidden: string[] = []) =>
  fields.filter(({ path }) => !hidden.includes(path!))

export const homeFactsResolver = (
  payload: EstimatePayload,
  hiddenFields: string[] = []
) => {
  const fields = visibleFields(homeFactsFields, hiddenFields)
  const listings = createResolver(
    fields as unknown as ResolverItem[],
    payload as any
  )

  return listings.filter((listing) => !isEmptyValue(listing.value))
}
