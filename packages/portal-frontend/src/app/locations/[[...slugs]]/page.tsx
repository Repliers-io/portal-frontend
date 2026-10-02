import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import content from '@configs/content'
import features from '@configs/features'
import locationConfig from '@configs/location'
import { PageTemplate } from '@templates'
import { type PopularSearch } from '@defaults/location'
import { LocationsPageContent } from '@pages/locations'

import ListingPage from 'app/listing/[[...listingName]]/page'
import { type RouteParamsProps } from 'app/types'

import {
  areaOwnsShortUrl,
  fetchLocationsData,
  getAreaUrl,
  loadStaticTree,
  resolveLocation,
  type TreeResult
} from 'services/LocationsTree'
import { capitalize, formatAreaLabel } from 'utils/strings'
import { getLocationUrl, sanitizeUrl } from 'utils/urls'

import { fetchCityBuildingCounts } from '../../condos/_utils'

import {
  buildLocationMeta,
  fetchPopularSearchItems,
  getCatalogTitle,
  parseUrlFilters,
  parseUrlParams
} from './_utils'

// ISR with 1-hour revalidation for all location pages
// Main pages (root, areas, top cities) are pre-generated via generateStaticParams
export const revalidate = 3600
// searchParams/cookies/headers resolve to empty values instead of interrupting
// the prerender, so generateStaticParams pages are emitted as static HTML.
export const dynamic = 'force-static'

// `showAreas: false` means the tenant has no area level at all: `-area` is not
// parsed as a marker, and areas are absent from the sitemap, from SSG and from
// breadcrumbs. A name the tree happens to carry as an area must not quietly
// become a page there either.
const areaPages = locationConfig.showAreas

export type Params = {
  slugs: string[]
}

type LocationsPageProps = RouteParamsProps<Params>

export async function generateMetadata({
  params
}: LocationsPageProps): Promise<Metadata> {
  const { slugs } = await params
  const {
    location: {
      area: requestedArea,
      city: requestedCity,
      neighborhood: requestedHood
    },
    filters
  } = parseUrlParams(slugs || [])

  // Same resolution as the page below, so the title and canonical describe the
  // location the visitor actually gets rather than the slug's spelling.
  const { tree } = await loadStaticTree()
  const { areaNode, cityNode, hoodNode } = resolveLocation(tree, {
    area: requestedArea,
    city: requestedCity,
    hood: requestedHood
  })
  const areaMatch = areaPages ? areaNode : undefined
  const area = areaMatch?.name ?? requestedArea
  const city = areaMatch ? '' : (cityNode?.name ?? requestedCity)
  const hood = hoodNode?.name ?? requestedHood

  const locationLabel = hood
    ? capitalize(hood)
    : city
      ? capitalize(city)
      : area
        ? formatAreaLabel(area)
        : locationConfig.state

  const catalogTitle = getCatalogTitle(filters)
  const { title, description } = buildLocationMeta(
    locationLabel,
    catalogTitle,
    locationConfig.state,
    String(content.pagesMeta.locations?.description ?? '')
  )

  // Canonical is built with the same builder the site's links + sitemap use
  // (getLocationUrl → sanitizeUrl) instead of echoing the raw path, so spelling
  // variants collapse to one URL and the canonical matches the public form.
  // An area is canonical at its short URL, so /on/toronto and /on/toronto-area
  // both point at /on/toronto.
  const canonicalPath =
    area && !city
      ? getAreaUrl(tree, area, filters)
      : getLocationUrl({ area, city, hood, filters })

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalPath,
      siteName: content.siteName
    }
  }
}

/**
 * Pre-generate main location pages at build time:
 * - Root page
 * - All area pages
 * - Top cities (sorted by listing count)
 */
export async function generateStaticParams(): Promise<Params[]> {
  // Disable static generation if locations feature is disabled
  if (!features.locations) return []
  if (process.env.DISABLE_SSG === 'true') return []

  let treeResult: TreeResult
  try {
    treeResult = await loadStaticTree()
  } catch {
    // locations.json not found for this tenant — skip SSG
    return []
  }
  const { tree } = treeResult

  const params: Params[] = [
    // Root page
    { slugs: [] }
  ]

  if (areaPages) {
    // Pre-generate the URL each area is canonical at — the short one unless a
    // city of the same name owns it.
    for (const area of tree.areas) {
      const areaSlug = sanitizeUrl(area.name)
      params.push({
        slugs: [
          areaOwnsShortUrl(tree, area.name) ? areaSlug : `${areaSlug}-area`
        ]
      })
    }
  }

  // Add top 50 cities - now with activeCount already mapped
  const allCities = tree.areas.flatMap((area) => area.cities || [])

  const sortedCities = allCities
    .filter((c) => c.activeCount)
    .sort((a, b) => b.activeCount! - a.activeCount!)
    .slice(0, 100)

  for (const city of sortedCities) {
    params.push({ slugs: [sanitizeUrl(city.name)] })
  }

  if (process.env.LOG_STATIC_PARAMS === 'true') {
    // eslint-disable-next-line no-console
    console.log('[SSG] /locations/[[...slugs]]:', JSON.stringify(params))
  }
  return params
}

const LocationsPage = async ({ params }: LocationsPageProps) => {
  const { slugs } = await params

  if (!features.locations) notFound()

  const {
    filters,
    boardId,
    listingId,
    localAddress,
    location: {
      area: requestedArea,
      city: requestedCity,
      neighborhood: requestedHood
    }
  } = parseUrlParams(slugs)

  // render property page component if listingId is present and emulate its old url format
  if (listingId) {
    return (
      <ListingPage
        params={{ listingName: [`${localAddress}-${listingId}`] }}
        searchParams={{ boardId }}
      />
    )
  }

  // Query by the tree's own spelling: the API matches names exactly, so a variant slug
  // like `queenanne` would otherwise ask for a name that does not exist and render an
  // empty page. Unknown names fall through unchanged.
  const { tree } = await loadStaticTree()
  const { areaNode, cityNode, hoodNode } = resolveLocation(tree, {
    area: requestedArea,
    city: requestedCity,
    hood: requestedHood
  })
  // A name the tree carries as an area, not a city, turns the request into the
  // area page it describes — otherwise the page asks for neighbourhoods of a
  // city that does not exist and renders neither a list nor a description.
  const areaMatch = areaPages ? areaNode : undefined
  const area = areaMatch?.name ?? requestedArea
  const city = areaMatch ? '' : (cityNode?.name ?? requestedCity)
  const hood = hoodNode?.name ?? requestedHood

  const searchFilters = parseUrlFilters(filters)

  // Fetch locations tree data with counts
  const [
    { areas, cities, hoods, location, nearbies },
    searches,
    buildingCounts
  ] = await Promise.all([
    fetchLocationsData({ area, city, hood }),
    fetchPopularSearchItems({ city, hood }) as Promise<PopularSearch[] | null>,
    features.buildings && city
      ? fetchCityBuildingCounts([city])
      : Promise.resolve({} as Record<string, number>)
  ])

  const cityHasBuildings =
    features.buildings && city ? (buildingCounts[city] ?? 0) > 0 : undefined

  return (
    <PageTemplate>
      <LocationsPageContent
        area={area}
        city={city}
        hood={hood}
        areas={areas}
        hoods={hoods}
        cities={cities}
        nearbies={nearbies}
        urlFilters={filters}
        location={location}
        searches={searches}
        searchFilters={searchFilters}
        cityHasBuildings={cityHasBuildings}
      />
    </PageTemplate>
  )
}

export default LocationsPage
