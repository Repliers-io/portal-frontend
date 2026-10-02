/* eslint-disable react/destructuring-assignment */
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { type Position } from 'geojson'

import content from '@configs/content'
import features from '@configs/features'
import mapConfig from '@configs/map'
import { PageTemplate } from '@templates'
import { TokenLoginHandler } from '@templates/components'
import { type InitialView } from '@defaults/map'
import { MapPageContent } from '@pages/search'

import { type RouteProps } from 'app/types'

import { ApiError, APISavedSearch, type ApiSavedSearch } from 'services/API'
import {
  type Filters,
  getNonDefaultFilters,
  type MapPoint
} from 'services/Search'
import AiSearchProvider from 'providers/AiSearchProvider'
import MapOptionsProvider from 'providers/MapOptionsProvider'
import SearchProvider from 'providers/SearchProvider'
import { parsePoint } from 'utils/map'
import { defaultActiveLayerIds } from 'utils/map/overlays'
import { arrayFromString } from 'utils/strings'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './_types'
import {
  fetchAreaName,
  getCameraFromParams,
  getFiltersFromParams,
  getFiltersFromSavedSearch,
  getOgMapImage,
  getPositionFromPolygon,
  humanizeFilters
} from './_utils'

export const generateMetadata = async (
  props: RouteProps<Params, SearchParams>
): Promise<Metadata> => {
  const searchParams = await props.searchParams
  const t = await getTranslations('Search')
  const baseMeta = content.pagesMeta.search

  const filters = getFiltersFromParams(searchParams)

  // Area name is resolved only for explicitly shared viewports (coords in the
  // URL) and only from city/neighborhood zoom — see fetchAreaName
  const urlCamera = getCameraFromParams(searchParams)
  const area = urlCamera ? await fetchAreaName(urlCamera) : undefined

  // Tenant-configured meta stays on the bare map URL; the humanized sentence
  // takes over when the share carries non-default filters or a resolved area
  const customized =
    Object.keys(getNonDefaultFilters(filters)).length > 0 || Boolean(area)
  const sentence = humanizeFilters(filters, area)

  const title = customized
    ? t('metaTitleTemplate', { sentence })
    : baseMeta?.title
  const description = customized
    ? t('metaDescriptionTemplate', { sentence })
    : baseMeta?.description

  // Shared default view still gets a map image via the tenant initial view
  const { lat, lng, zoom } = (mapConfig.searchArea.initialView ??
    {}) as Partial<InitialView>
  const camera = urlCamera ?? (lat && lng && zoom ? { lat, lng, zoom } : null)

  const host = getProtocolHost(await headers())
  const image = getOgMapImage(
    camera,
    searchParams as unknown as Record<string, string | string[] | undefined>,
    host
  )

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: '/search' },
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: content.siteName,
      ...(image && { images: [image] })
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] })
    }
  }
}

const MapPage = async (props: RouteProps<Params, SearchParams>) => {
  const params = await props.params
  const { style, layout } = params

  const searchParams = await props.searchParams
  const {
    searchId,
    aiImage,
    aiFeature,
    point: pointParam,
    polygon: polygonParam
  } = searchParams

  const aiImages = aiImage ? [aiImage].flat() : []
  const aiFeatures = aiFeature ? [aiFeature].flat() : []

  let title: string | undefined
  let position: any | undefined
  let filters: Filters | undefined
  let point: MapPoint | undefined
  let polygon: Position[] | undefined
  let region: Position[][] | undefined

  if (searchId) {
    let savedSearch: ApiSavedSearch
    try {
      savedSearch = await APISavedSearch.fetch(searchId)
    } catch (error) {
      // A missing or expired saved search returns 404 from the API — surface it
      // as the not-found page (HTTP 404) instead of letting the render crash
      // into a generic 500. Other errors keep their original status.
      if (error instanceof ApiError && error.status === 404) notFound()
      throw error
    }
    const { name, map } = savedSearch
    // The saved `map` may hold several polygons (a merged location selection).
    // A single ring keeps flowing as the editable drawn polygon; multi-ring
    // loads as the read-only `region` (the draw editor can't represent it).
    if (map.length === 1) polygon = map[0]
    else region = map

    title = name // use saved search name as map title (show special header)
    filters = getFiltersFromSavedSearch(savedSearch)
    // Camera framed over ALL rings — `map` is flattened to its points.
    position = getPositionFromPolygon(map.flat())
  } else {
    filters = getFiltersFromParams(searchParams)
    point = parsePoint(pointParam)
    polygon = arrayFromString(polygonParam)
  }

  if (!features.map) notFound()

  const layers = defaultActiveLayerIds(mapConfig.overlays.layers, 'search')

  return (
    <MapOptionsProvider
      title={title}
      style={style}
      layers={layers}
      layout={layout}
      position={position}
    >
      <SearchProvider
        filters={filters}
        polygon={polygon}
        region={region}
        point={point}
      >
        <AiSearchProvider images={aiImages} features={aiFeatures}>
          <PageTemplate noFooter>
            <TokenLoginHandler />
            <MapPageContent />
          </PageTemplate>
        </AiSearchProvider>
      </SearchProvider>
    </MapOptionsProvider>
  )
}

export default MapPage
