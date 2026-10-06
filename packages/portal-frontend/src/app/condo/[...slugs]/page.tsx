import { cache } from 'react'
import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import content from '@configs/content'
import features from '@configs/features'
import routes from '@configs/routes'
import { PageTemplate } from '@templates'
import { BuildingPageContent } from '@pages/building'

import {
  buildBuildingDescription,
  fetchBuildingOgImage
} from 'app/building/[...path]/_utils'
import { type RouteProps } from 'app/types'
import {
  getBuildingUrl,
  getLocationBuildingsUrl
} from 'components/pages/condos/utils'

import { type ApiBuilding } from 'services/API'
import { ACFParser, BuildingProvider } from 'providers/BuildingProvider'
import {
  assembleBuilding,
  findCmsSlugByApiBuilding,
  getBuildingName
} from 'utils/buildings'
import { capitalize } from 'utils/strings'
import { beautify } from 'utils/urls'

import {
  fetchLocationBuilding,
  fetchMatchedCmsBuilding,
  parseAddressSlug,
  parseCondoUrl
} from '../_utils'

export const revalidate = 86400
export const dynamicParams = true

type Params = { slugs: string[] }
type SearchParams = { name?: string }
type Props = RouteProps<Params, SearchParams>

// Resolve the building (Repliers + its CMS twin) once per request. Shared by
// generateMetadata and the page component (deduped via cache) so the metadata,
// canonical, and rendered body all describe the same building — and we fetch once.
const resolveCondoBuilding = cache(
  async (slugs: string[], nameParam?: string) => {
    const parsed = parseCondoUrl(slugs)
    const { city, neighborhood, address, slug } = parsed

    let apiBuilding: ApiBuilding | null = null
    if (nameParam) {
      apiBuilding = await fetchLocationBuilding({
        city,
        neighborhood,
        buildingName: decodeURIComponent(nameParam)
      })
    } else if (slug) {
      apiBuilding = await fetchLocationBuilding({
        city,
        neighborhood,
        buildingName: beautify(slug)
      })
    } else if (address) {
      const { streetNumber, streetName, buildingId } = parseAddressSlug(address)
      apiBuilding = await fetchLocationBuilding({
        city,
        neighborhood,
        streetNumber,
        streetName,
        buildingId
      })
    }

    if (!apiBuilding) {
      return { ...parsed, apiBuilding: null, cmsResult: null }
    }

    const cmsSlug = findCmsSlugByApiBuilding(apiBuilding, city, neighborhood)
    const cmsResult = await fetchMatchedCmsBuilding(cmsSlug)
    return { ...parsed, apiBuilding, cmsResult }
  }
)

export async function generateMetadata({
  params,
  searchParams
}: Props): Promise<Metadata> {
  // The page 404s below when the feature is off — bail before resolveCondoBuilding
  // so a request to /condo/* can't fire buildings API calls on disabled tenants.
  if (!features.buildings) return {}

  const { slugs } = await params
  const { name: nameParam } = await searchParams
  const { apiBuilding, cmsResult, address, slug } = await resolveCondoBuilding(
    slugs,
    nameParam
  )
  const cms = cmsResult?.cmsBuilding

  // URL-derived fallback title, used only when the building can't be resolved
  // (the page then redirects, so this metadata is never actually served).
  let fallbackTitle = 'Building'
  if (nameParam) {
    fallbackTitle = decodeURIComponent(nameParam)
  } else if (address) {
    const { streetNumber, streetName } = parseAddressSlug(address)
    fallbackTitle =
      [streetNumber, streetName]
        .filter(Boolean)
        .map((s) => capitalize(s || ''))
        .join(' ') || fallbackTitle
  } else if (slug) {
    fallbackTitle = beautify(slug)
  }

  // Prefer the CMS name, then the Repliers name, over the raw URL slug.
  const name =
    cms?.name ||
    (apiBuilding ? getBuildingName(apiBuilding) : '') ||
    fallbackTitle

  // Yoast's snippet fields are the copy the SEO team authors in WordPress, so they win.
  // The term name and the term body text stay as the fallback for buildings with no SEO copy.
  const title = cms?.yoastHead?.title || name

  const description =
    cms?.yoastHead?.description ||
    (cms?.description
      ? buildBuildingDescription(name, cms.description, '')
      : String(content.pagesMeta.condo?.description ?? '').replace(
          '{buildingName}',
          name
        ))

  // Canonical = the single building URL the sitemap + internal links use, so the
  // name-only redirect form and the address form collapse to one indexed page.
  const canonical = apiBuilding
    ? getBuildingUrl(apiBuilding)
    : `${routes.condo}/${slugs.join('/')}`

  // OG image: prefer the CMS slideshow image, fall back to the Repliers building image.
  const cmsOgImages = cms ? await fetchBuildingOgImage(cms) : []
  const images =
    cmsOgImages.length > 0
      ? cmsOgImages
      : apiBuilding?.image
        ? [{ url: apiBuilding.image }]
        : []

  return {
    title,
    description,
    openGraph: {
      type: 'website' as const,
      siteName: content.siteName,
      ...(images.length > 0 && { images })
    },
    alternates: { canonical }
  }
}

const CondoPage = async ({ params, searchParams }: Props) => {
  if (!features.buildings) notFound()

  const { slugs } = await params
  const { name: nameParam } = await searchParams
  const { area, city, neighborhood, apiBuilding, cmsResult } =
    await resolveCondoBuilding(slugs, nameParam)

  if (!apiBuilding) {
    redirect(getLocationBuildingsUrl({ area, city }))
  }

  const t = await getTranslations('Building')

  const acf = cmsResult?.cmsBuilding
    ? new ACFParser(
        cmsResult.cmsBuilding.acf,
        cmsResult.cmsBuilding._embedded,
        cmsResult.relatedBuildings
      )
    : undefined

  const merged = assembleBuilding({
    t,
    apiBuilding,
    cmsBuilding: cmsResult?.cmsBuilding,
    acf,
    reviews: cmsResult?.reviews,
    location: { city, neighborhood }
  })

  return (
    <PageTemplate>
      <BuildingProvider building={merged}>
        <BuildingPageContent />
      </BuildingProvider>
    </PageTemplate>
  )
}

export default CondoPage
