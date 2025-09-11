import { type Property } from 'services/API'
import { type Primitive } from 'utils/formatters'

export type ResolverItem = {
  label: string
  path?: string
  fn?: (obj: Property, value?: any) => string
}

export type DetailsItemType = {
  label?: string
  value: Primitive
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

export type DetailsSections = {
  [key in DetailsSectionName]: DetailsSectionType
}
