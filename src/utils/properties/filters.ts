import { type ApiSortBy, type Property } from 'services/API'
import { type Filters } from 'services/Search'

export const sortWithFilters = (properties: Property[], filters: Filters) => {
  const { sortBy } = filters

  const getTime = (date: string) => new Date(date).getTime()

  const compareFunctions: Partial<{
    [key in ApiSortBy]: (a: Property, b: Property) => number
  }> = {
    createdOnDesc: (a, b) => getTime(b.listDate) - getTime(a.listDate),
    updatedOnDesc: (a, b) => getTime(b.updatedOn) - getTime(a.updatedOn),
    listPriceDesc: (a, b) => Number(b.listPrice) - Number(a.listPrice),
    listPriceAsc: (a, b) => Number(a.listPrice) - Number(b.listPrice)
  }

  const compareFunc = compareFunctions[sortBy!]

  return compareFunc ? [...properties].sort(compareFunc) : properties
}
