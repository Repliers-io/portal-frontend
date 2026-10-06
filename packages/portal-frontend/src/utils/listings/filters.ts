import { type ApiListing, type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'

export const sortWithFilters = (listings: ApiListing[], filters: Filters) => {
  const { sortBy } = filters

  const getTime = (date: string) => new Date(date).getTime()

  const compareFunctions: Partial<
    Record<ApiSortBy, (a: ApiListing, b: ApiListing) => number>
  > = {
    createdOnDesc: (a, b) => getTime(b.listDate) - getTime(a.listDate),
    updatedOnDesc: (a, b) => getTime(b.updatedOn) - getTime(a.updatedOn),
    listPriceDesc: (a, b) => Number(b.listPrice) - Number(a.listPrice),
    listPriceAsc: (a, b) => Number(a.listPrice) - Number(b.listPrice)
  }

  const compareFunc = compareFunctions[sortBy!]

  return compareFunc ? [...listings].sort(compareFunc) : listings
}
