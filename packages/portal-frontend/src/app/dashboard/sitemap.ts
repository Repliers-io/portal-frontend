import { type MetadataRoute } from 'next'

import features from '@configs/features'
import locationConfig from '@configs/location'
import routes from '@configs/routes'

import { loadStaticTree } from 'services/LocationsTree'
import { sanitizeUrl } from 'utils/urls'

export const dynamic = 'force-static'

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!features.dashboard) return []
  if (process.env.DISABLE_SSG === 'true') return []

  const defaultSet = new Set(
    (locationConfig.defaultCities as string[]).map((c) => c.toLowerCase())
  )

  let extraCitySlugs: string[] = []
  try {
    const { tree } = await loadStaticTree()
    extraCitySlugs = tree.areas
      .flatMap((area) => area.cities || [])
      .filter((city) => !defaultSet.has(city.name.toLowerCase()))
      .sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0))
      .slice(0, 20)
      .map((city) => sanitizeUrl(city.name))
  } catch {
    // fall back to default cities only
  }

  const defaultSlugs = (locationConfig.defaultCities as string[]).map(
    sanitizeUrl
  )

  const root: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}${routes.dashboard}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    }
  ]

  const defaultCityPages: MetadataRoute.Sitemap = defaultSlugs.map((slug) => ({
    url: `${baseUrl}${routes.dashboard}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6
  }))

  const extraCityPages: MetadataRoute.Sitemap = extraCitySlugs.map((slug) => ({
    url: `${baseUrl}${routes.dashboard}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4
  }))

  return [...root, ...defaultCityPages, ...extraCityPages]
}
