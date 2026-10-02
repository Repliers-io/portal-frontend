import addresser from 'addresser'

import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { type BuildingInfoItem } from '@pages/building/components/BuildingInfo'
import { type BreadcrumbItem } from '@shared/Breadcrumbs'
import { type NavigationBarItem } from '@shared/NavigationBar'

import { type ApiBuilding, type ApiBuildingAddress } from 'services/API'
import {
  type ACFParser,
  type CmsBuilding,
  type SlideshowImage
} from 'providers/BuildingProvider'
import { formatEnglishNumber } from 'utils/formatters'
import { toMapboxZoom } from 'utils/map/converters'
import { capitalize } from 'utils/strings'

import { getBuildingName } from './getBuildingName'
import {
  type Building,
  type BuildingFAQ,
  type BuildingMap,
  type BuildingReviews,
  type BuildingSection
} from './types'

type Translator = (key: string) => string

type LocationContext = {
  area?: string
  city?: string
  neighborhood?: string
}

// --- Address parsing ---

/**
 * Parse a CMS map address string (e.g. "588 Bell St, Seattle, WA, United States")
 * into a structured ApiBuildingAddress using the addresser package.
 *
 * `streetName` is the bare name ("Bell"), NOT folded with its suffix ("Bell St") —
 * the MLS API keeps the suffix in a separate field, so a folded value fails to match.
 * Suffix/direction are intentionally left out: addresser abbreviates the suffix ("St")
 * while the API stores it in full ("Street"), so filtering by it drops matching
 * listings. Match on streetName only.
 */
export const parseMapAddress = (
  address: string | undefined
): ApiBuildingAddress | undefined => {
  if (!address) return undefined

  try {
    const {
      streetNumber,
      streetName,
      // streetSuffix,
      // streetDirection,
      placeName: city,
      stateAbbreviation: state,
      zipCode: zip
    } = addresser.parseAddress(address)

    return {
      ...(streetNumber && { streetNumber }),
      ...(streetName && { streetName }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zip && { zip })
    }
  } catch {
    return undefined
  }
}

// --- Specs ---

const formatSqft = (value: number | string) => {
  const number = Math.floor(parseInt(String(value), 10))
  return `${formatEnglishNumber(number)} sqft`
}

const formatSizeRange = (minSqft?: number, maxSqft?: number): string | null => {
  if (!minSqft && !maxSqft) return null
  if (!maxSqft || minSqft === maxSqft) {
    return formatSqft(minSqft!)
  }
  return `${formatSqft(minSqft!)} - ${formatSqft(maxSqft)}`
}

/**
 * Merge building specs from API and CMS sources.
 * API values take priority for overlapping fields (yearBuilt/built, stories).
 * CMS-only fields (units, architect, developer, builder, rentalCap) are appended.
 * API-only fields (condoSize) are included.
 */
export const buildSpecs = (
  t: Translator,
  apiBuilding?: ApiBuilding,
  acf?: ACFParser
): BuildingInfoItem[] => {
  const apiDetails = apiBuilding?.details
  const apiStories = apiBuilding?.condominium?.stories

  // Overlapping fields — API takes priority
  const yearBuilt = apiDetails?.yearBuilt || acf?.built
  const stories = apiStories || acf?.stories

  // API-only
  const condoSize = formatSizeRange(apiDetails?.minSqft, apiDetails?.maxSqft)

  // CMS-only
  const units = acf?.units
  const architect = acf?.architect
  const developer = acf?.developer
  const builder = acf?.builder
  const rentalCap = acf?.rental_cap

  const items: BuildingInfoItem[] = [
    { label: t('built'), value: yearBuilt, type: 'numeric' },
    { label: t('units'), value: units, type: 'numeric' },
    { label: t('stories'), value: stories, type: 'numeric' },
    { label: t('condoSize'), value: condoSize, type: 'text' },
    { label: t('architect'), value: architect, type: 'text' },
    { label: t('developer'), value: developer, type: 'text' },
    { label: t('builder'), value: builder, type: 'text' },
    { label: t('rentalCap'), value: rentalCap, type: 'text' }
  ]

  return items
}

// --- Data merge (API + CMS) ---

type MergeParams = {
  apiBuilding?: ApiBuilding | null
  cmsBuilding?: CmsBuilding | null
  acf?: ACFParser
  reviews?: { posts: any[]; totalPosts: number }
  specs: BuildingInfoItem[]
  location?: LocationContext
}

function resolveMap(
  apiBuilding?: ApiBuilding | null,
  acf?: ACFParser
): BuildingMap | undefined {
  if (apiBuilding?.map?.latitude && apiBuilding?.map?.longitude) {
    return {
      lat: Number(apiBuilding.map.latitude),
      lng: Number(apiBuilding.map.longitude),
      address: acf?.map?.address,
      description: acf?.map_description
    }
  }

  if (acf?.map?.lat && acf?.map?.lng) {
    const googleZoom = acf.map.zoom
    return {
      lat: Number(acf.map.lat),
      lng: Number(acf.map.lng),
      zoom: googleZoom ? toMapboxZoom(googleZoom) : undefined,
      address: acf.map.address,
      description: acf.map_description
    }
  }

  return undefined
}

/**
 * Merge API and CMS building data into a single model.
 *
 * Priority: API wins for name/address/amenities, CMS enriches with
 * gallery/description/FAQ/sections. Either source can be absent.
 *
 * This is a pure data merge — no parsing, no translation, no view logic.
 * ACF parsing and t-dependent builders (specs, breadcrumbs, navigation)
 * belong in the route layer.
 */
export const mergeBuildings = ({
  apiBuilding,
  cmsBuilding,
  acf,
  reviews: reviewsInput,
  specs,
  location
}: MergeParams): Omit<Building, 'breadcrumbs' | 'navigationItems'> => {
  const name = apiBuilding
    ? getBuildingName(apiBuilding) || cmsBuilding?.name || ''
    : cmsBuilding?.name || ''

  const slug = cmsBuilding?.slug || apiBuilding?.slug

  const address: ApiBuildingAddress | undefined =
    apiBuilding?.address || parseMapAddress(acf?.map?.address)

  const loc = {
    area: location?.area || address?.area,
    city: location?.city || address?.city,
    neighborhood: location?.neighborhood || address?.neighborhood
  }

  const gallery: SlideshowImage[] = acf?.slideshow || []
  const heroImage = apiBuilding?.image || gallery[0]?.large

  const map = resolveMap(apiBuilding, acf)

  const amenities: string[] | string = apiBuilding?.condominium?.amenities
    ?.length
    ? apiBuilding.condominium.amenities
    : acf?.amenities || []

  const nearbyAmenities: string[] = apiBuilding?.nearby?.amenities || []

  const description =
    [cmsBuilding?.description, acf?.description].filter(Boolean).join('') ||
    undefined

  const sections: BuildingSection[] = acf?.sections || []
  const faqs: BuildingFAQ[] = acf?.faqs || []

  const reviews: BuildingReviews = reviewsInput || {
    posts: [],
    totalPosts: 0
  }

  return {
    name,
    slug,
    address,
    location: loc,
    gallery,
    heroImage,
    map,
    specs,
    amenities,
    nearbyAmenities,
    description,
    sections,
    faqs,
    reviews,
    apiBuilding: apiBuilding || undefined,
    cmsBuilding: cmsBuilding || undefined
  }
}

// --- Breadcrumbs ---

const buildBreadcrumbs = (
  t: Translator,
  location: LocationContext,
  buildingName: string,
  locationBuilding?: boolean
): BreadcrumbItem[] => {
  const buildingsHref = locationBuilding ? routes.condos : routes.buildings
  const items: BreadcrumbItem[] = [
    { label: t('buildings'), href: buildingsHref }
  ]

  const getUrl = (params: { area?: string; city?: string; hood?: string }) => {
    const parts: string[] = []
    if (params.area && locationConfig.showAreas)
      parts.push(`${params.area}-area`)
    if (params.city) parts.push(params.city)
    if (params.hood) parts.push(params.hood)
    return `${routes.condos}/${parts.join('/')}`
  }

  if (location.area && locationConfig.showAreas) {
    items.push({
      label: capitalize(location.area) + ' Area',
      href: getUrl({ area: location.area })
    })
  }

  if (location.city) {
    items.push({
      label: capitalize(location.city),
      href: getUrl({ area: location.area, city: location.city })
    })
  }

  if (location.neighborhood) {
    items.push({
      label: capitalize(location.neighborhood),
      href: getUrl({
        area: location.area,
        city: location.city,
        hood: location.neighborhood
      })
    })
  }

  if (buildingName) {
    items.push({ label: buildingName })
  }

  return items
}

// --- Navigation ---

type NavigationData = {
  hasSpecs: boolean
  hasAmenities: boolean
  hasMap: boolean
  hasFaqs: boolean
  hasReviews: boolean
  hasSections: boolean
}

const buildNavigationItems = (
  t: Translator,
  data: NavigationData
): NavigationBarItem[] => {
  const items: NavigationBarItem[] = []

  if (data.hasSpecs) {
    items.push({ id: 'info', label: t('navigation.info') })
  }

  if (data.hasAmenities) {
    items.push({ id: 'amenities', label: t('navigation.amenities') })
  }

  // Condos (listings) — always show
  items.push({ id: 'condos', label: t('navigation.condos') })

  // Map as separate section only in gallery mode (not in image+map header mode)
  if (data.hasMap) {
    items.push({ id: 'location', label: t('navigation.location') })
  }

  if (data.hasFaqs) {
    items.push({ id: 'faq', label: t('navigation.faq') })
  }

  if (data.hasReviews) {
    items.push({ id: 'reviews', label: t('navigation.reviews') })
  }

  if (data.hasSections) {
    items.push({ id: 'videos', label: t('navigation.videos') })
  }

  // Sold — always show
  items.push({ id: 'sold', label: t('navigation.sold') })

  return items
}

// --- Orchestration ---

type AssembleParams = {
  t: Translator
  apiBuilding?: ApiBuilding | null
  cmsBuilding?: CmsBuilding | null
  acf?: ACFParser
  reviews?: { posts: any[]; totalPosts: number }
  location?: LocationContext
}

/**
 * Full assembly pipeline: parse specs → merge data → build breadcrumbs → build navigation.
 * Called from route page.tsx files where translator is available.
 */
export const assembleBuilding = ({
  t,
  apiBuilding,
  cmsBuilding,
  acf,
  reviews,
  location
}: AssembleParams): Building => {
  const specs = buildSpecs(t, apiBuilding || undefined, acf)

  const merged = mergeBuildings({
    apiBuilding,
    cmsBuilding,
    acf,
    reviews,
    specs,
    location
  })

  const breadcrumbs = buildBreadcrumbs(
    t,
    merged.location,
    merged.name,
    !!apiBuilding
  )

  const navigationItems = buildNavigationItems(t, {
    hasSpecs: specs.some((s) => !!s.value),
    hasAmenities:
      (Array.isArray(merged.amenities)
        ? merged.amenities.length > 0
        : !!merged.amenities) || merged.nearbyAmenities.length > 0,
    hasMap: merged.gallery.length < 2 ? false : !!merged.map,
    hasFaqs: merged.faqs.length > 0,
    hasReviews: merged.reviews.posts.length > 0,
    hasSections: merged.sections.some((s) => s.videoIds?.length)
  })

  return {
    ...merged,
    breadcrumbs,
    navigationItems
  }
}
