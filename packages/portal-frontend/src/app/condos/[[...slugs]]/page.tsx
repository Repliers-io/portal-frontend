import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import features from '@configs/features'
import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { PageTemplate } from '@templates'
import { LocBuildingsIndexPageContent } from '@pages/condos'

import { fetchAllCmsBuildingsWithMedia } from 'app/buildings/_utils'
import { parseUrlParams } from 'app/locations/[[...slugs]]/_utils'
import { type RouteProps } from 'app/types'

import { type ApiLocation, transient } from 'services/API'
import {
  type CityWithNeighborhoods,
  extractCities,
  extractNeighborhoods,
  fetchLocationsData,
  loadStaticTree,
  resolveLocation
} from 'services/LocationsTree'
import { hasCmsBuildingRedirects } from 'utils/buildings/buildingMatcher'
import { capitalize } from 'utils/strings'
import { getLocationUrl, sanitizeUrl } from 'utils/urls'

import {
  enrichBuildingsWithCmsData,
  type EnrichedBuilding,
  fetchCityBuildingCounts,
  fetchHoodBuildingCounts,
  fetchLocationBuildings,
  topCitiesForBuildings
} from '../_utils'

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams(): Promise<{ slugs: string[] }[]> {
  if (!features.locations || !features.buildings) return []
  if (process.env.DISABLE_SSG === 'true') return []

  const { tree } = await loadStaticTree()

  const params: { slugs: string[] }[] = [{ slugs: [] }]

  if (locationConfig.showAreas) {
    for (const area of tree.areas) {
      params.push({ slugs: [`${sanitizeUrl(area.name)}-area`] })
    }
  }

  const allCities: CityWithNeighborhoods[] = tree.areas.flatMap(
    (area) => area.cities || []
  )
  const topCityNames = allCities
    .filter((c) => c.activeCount)
    .sort((a, b) => b.activeCount! - a.activeCount!)
    .slice(0, topCitiesForBuildings)
    .map((c) => c.name)

  const cityCounts = await fetchCityBuildingCounts(topCityNames)

  const citiesWithBuildings = topCityNames.filter(
    (name) => (cityCounts[name] ?? 0) > 0
  )

  for (const cityName of citiesWithBuildings) {
    params.push({ slugs: [sanitizeUrl(cityName)] })

    const cityNode = allCities.find((c) => c.name === cityName)
    const hoodNames = (cityNode?.neighborhoods ?? [])
      .map((h) => h.name)
      .filter(Boolean) as string[]
    const hoodCounts = hoodNames.length
      ? await fetchHoodBuildingCounts(cityName, hoodNames)
      : {}

    for (const hoodName of hoodNames) {
      if ((hoodCounts[hoodName] ?? 0) > 0) {
        params.push({
          slugs: [sanitizeUrl(cityName), sanitizeUrl(hoodName)]
        })
      }
    }
  }

  if (process.env.LOG_STATIC_PARAMS === 'true') {
    // eslint-disable-next-line no-console
    console.log('[SSG] /condos:', JSON.stringify(params))
  }
  return params
}

type Params = { slugs: string[] }
type SearchParams = { page?: string }
type Props = RouteProps<Params, SearchParams>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params
  const {
    location: { area, city: requestedCity, neighborhood: requestedHood },
    filters
  } = parseUrlParams(slugs || [])

  // Resolve to the tree's spelling so the title and the canonical describe the page
  // the visitor actually gets — a variant slug renders the resolved location's content.
  const { tree } = await loadStaticTree()
  const { cityNode, hoodNode } = resolveLocation(tree, {
    area,
    city: requestedCity,
    hood: requestedHood
  })
  const city = cityNode?.name ?? requestedCity
  const hood = hoodNode?.name ?? requestedHood

  const parts = [hood, city, area].filter(Boolean).map(capitalize)
  const location = parts.join(', ')
  const meta = content.pagesMeta.condosBrowse
  const title = location
    ? String(meta?.title ?? '').replace('{location}', location)
    : String(content.pagesMeta.buildings?.title ?? '')
  const description = location
    ? String(meta?.description ?? '').replace('{location}', location)
    : String(content.pagesMeta.buildings?.description ?? '')

  return {
    title,
    description,
    alternates: {
      // Canonical is built with the SAME slugifier the site's links use
      // (sanitizeUrl, via getLocationUrl) instead of echoing the raw request, so
      // spelling variants (`arbor-heights`, `arbor%20heights`) collapse to one URL.
      canonical: getLocationUrl({
        area,
        city,
        hood,
        filters,
        basePrefix: routes.condos
      })
    },
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: content.siteName
    }
  }
}

const CondosPage = async ({ params, searchParams }: Props) => {
  if (!features.buildings) notFound()

  const { slugs } = await params
  const page = Number((await searchParams).page) || 1

  const {
    location: { area, city: requestedCity, neighborhood: requestedHood }
  } = parseUrlParams(slugs || [])

  // The tree is a local pre-generated file. Load it first and 404 any location
  // slug that matches no real city/hood — a garbage slug must be a 404, not an
  // indexable empty 200. notFound() stays OUTSIDE the try below: inside, its
  // control-flow signal would be caught and the page would render a 200.
  const { tree } = await loadStaticTree()
  const { cityNode, hoodNode } = resolveLocation(tree, {
    area,
    city: requestedCity,
    hood: requestedHood
  })
  if (requestedCity) {
    if (!cityNode) notFound()
    if (requestedHood && !hoodNode) notFound()
  }

  // Everything below queries and links by the tree's own spelling, not the slug's:
  // the API matches names exactly, so a variant like `arborheights` would otherwise
  // pass the check above and then fetch nothing.
  const city = cityNode?.name ?? requestedCity
  const hood = hoodNode?.name ?? requestedHood

  // Empty defaults so a failing upstream (e.g. a geo-blocked CMS/API request)
  // renders an empty catalog (200) instead of a 500 — the same graceful
  // degradation the /locations pages already have. BuildingsEmptyState covers
  // the no-results view.
  let buildings: EnrichedBuilding[] = []
  let count = 0
  let numPages = 0
  let cities: ApiLocation[] = []
  let hoods: ApiLocation[] = []
  let location: ApiLocation | undefined
  let cityCounts: Record<string, number> = {}
  let hoodCounts: Record<string, number> = {}

  try {
    // Step 1: fetch listing results (the tree is already loaded above, for slug
    // validation and the sidebar city list).
    // NOTE: area is intentionally NOT passed to the API — it doesn't support
    // area-level filtering yet. Buildings are fetched by city/hood only.
    const [response, cmsBuildings] = await Promise.all([
      fetchLocationBuildings({ area, city, hood, page }),
      hasCmsBuildingRedirects
        ? fetchAllCmsBuildingsWithMedia()
        : Promise.resolve([])
    ])

    // Step 2: determine sidebar counts — city counts at state/area/city level,
    // hood counts at neighborhood level.
    const topCityNames = !hood
      ? extractCities(tree, area)
          .sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0))
          .filter((c) => c.name !== city)
          .slice(0, topCitiesForBuildings)
          .map((c) => c.name)
      : []

    const hoodNames =
      hood && city
        ? extractNeighborhoods(tree, city, area)
            .filter((h) => h.name !== hood)
            .map((h) => h.name)
        : []

    // Step 3: fetch building counts first so we can limit the subsequent
    // coordinate fetch to only the cities that actually have buildings.
    const [nextCityCounts, nextHoodCounts] = await Promise.all([
      topCityNames.length
        ? fetchCityBuildingCounts(topCityNames)
        : Promise.resolve({} as Record<string, number>),
      hoodNames.length && city
        ? fetchHoodBuildingCounts(city, hoodNames)
        : Promise.resolve({} as Record<string, number>)
    ])
    cityCounts = nextCityCounts
    hoodCounts = nextHoodCounts

    const citiesWithBuildings = topCityNames.filter(
      (name) => (cityCounts[name] ?? 0) > 0
    )

    // Step 4: load the full location context — coordinates are requested only
    // for the filtered city set, keeping the API URL well within length limits.
    const locationsData = await fetchLocationsData({
      area,
      city,
      hood,
      cityMapData: true,
      mapCitiesFilter: citiesWithBuildings.length
        ? citiesWithBuildings
        : undefined
    })

    count = response.count
    numPages = response.numPages
    buildings = enrichBuildingsWithCmsData(response.buildings, cmsBuildings)
    cities = locationsData.cities
    hoods = locationsData.hoods
    location = locationsData.location
  } catch (error) {
    console.error('[CondosPage] failed to load buildings catalog', error)
    if (transient(error)) throw error
  }

  return (
    <PageTemplate>
      <LocBuildingsIndexPageContent
        area={area}
        city={city}
        hood={hood}
        page={page}
        count={count}
        numPages={numPages}
        buildings={buildings}
        cities={cities}
        hoods={hoods}
        location={location}
        cityCounts={cityCounts}
        hoodCounts={hoodCounts}
      />
    </PageTemplate>
  )
}

export default CondosPage
