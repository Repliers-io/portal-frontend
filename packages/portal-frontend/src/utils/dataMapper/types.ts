import { type EstimatePayload } from '@configs/estimate'

import { type ApiListing } from 'services/API'
import { type Primitive } from 'utils/formatters'

// Defaults to the listing, which every PDP section resolves against; a section fed
// by another source (the assessor record) names its own type.
export type ResolverItem<T = ApiListing> = {
  label: string
  path?: string
  // Null is the mapper's "nothing to show": `isEmptyValue` drops the row, and the
  // group with it when every row is empty.
  fn?: (obj: T, value?: any) => string | null
}

// Estimate-results counterpart of ResolverItem, typed for the EstimatePayload
// shape instead of ApiListing (the estimate page resolves a different object).
export type EstimateResolverItem = {
  label: string
  path?: string
  fn?: (payload: EstimatePayload, value?: any) => string | null
}

export type DetailsItemType = {
  label?: string
  value: Primitive
  // Per-item override for the masked placeholder shown when `value` is scrubbed;
  // date rows set the date-shaped dummy so the skeleton matches the header.
  scrubbedValue?: string
}

export type DetailsGroupType = {
  title?: string
  items: DetailsItemType[]
}

export type DetailsSectionType = {
  name: string
  shortName?: string // TODO: NOTE: will be used for NavigationBar buttons
  groups: DetailsGroupType[]
}

type DetailsSectionName =
  | 'home'
  | 'features'
  | 'exterior'
  | 'neighborhood'
  | 'rooms'
  | 'sales-history'
  | 'estimate-history'

export type DetailsSections = Record<DetailsSectionName, DetailsSectionType>
