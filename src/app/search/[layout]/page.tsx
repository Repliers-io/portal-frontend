import { type Metadata } from 'next'
import { features } from 'features'
import { type Position } from 'geojson'

import { Page404Template, PageTemplate } from '@templates'
import MapPageContent from '@pages/search'

import { APISaveSearch } from 'services/API'
import { type Filters } from 'services/Search'
import AiSearchProvider from 'providers/AiSearchProvider'
import MapOptionsProvider from 'providers/MapOptionsProvider'
import SearchProvider from 'providers/SearchProvider'

import { type Params, type SearchParams } from './_types'
import {
  getFiltersFromParams,
  getFiltersFromSavedSearch,
  getPositionFromPolygon
} from './_utils'

const title = 'Search Results'

export const metadata: Metadata = { title }

const MapPage = async (props: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { style, layout } = params
  const { searchId, aiImage, aiFeature } = searchParams

  let title: string | undefined
  let position: any | undefined
  let filters: Filters | undefined
  let polygon: Position[] | undefined

  if (searchId) {
    const savedSearch = await APISaveSearch.fetch(searchId)
    const { name, map } = savedSearch
    polygon = map[0]

    title = name // use saved search name as map title (show special header)
    filters = getFiltersFromSavedSearch(savedSearch)
    position = getPositionFromPolygon(polygon)
  } else {
    filters = getFiltersFromParams(searchParams)
  }

  if (!features.map) return <Page404Template />

  return (
    <PageTemplate noFooter>
      <MapOptionsProvider
        title={title}
        position={position}
        layout={layout}
        style={style}
      >
        <SearchProvider filters={filters} polygon={polygon}>
          <AiSearchProvider image={aiImage} feature={aiFeature}>
            <MapPageContent />
          </AiSearchProvider>
        </SearchProvider>
      </MapOptionsProvider>
    </PageTemplate>
  )
}

export default MapPage
