import { type MetadataRoute } from 'next'

import features from '@configs/features'
import locationConfig from '@configs/location'
import routes from '@configs/routes'

import { transient } from 'services/API'
import { loadStaticTree } from 'services/LocationsTree'
import { logError } from 'utils/log'
import { sanitizeUrl } from 'utils/urls'

import {
  fetchCityBuildingCounts,
  fetchHoodBuildingCounts,
  topCitiesForBuildings
} from './_utils'

export const revalidate = 86400

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!features.buildings) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const { tree } = await loadStaticTree()

    const entries: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}${routes.condos}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9
      }
    ]

    if (locationConfig.showAreas) {
      for (const area of tree.areas) {
        entries.push({
          url: `${baseUrl}${routes.condos}/${sanitizeUrl(area.name)}-area`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8
        })
      }
    }

    const allCities = tree.areas.flatMap((area) => area.cities || [])
    const topCityNames = allCities
      .filter((c) => c.activeCount)
      .sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0))
      .slice(0, topCitiesForBuildings)
      .map((c) => c.name)

    const cityCounts = await fetchCityBuildingCounts(topCityNames)
    const citiesWithBuildings = new Set(
      topCityNames.filter((name) => (cityCounts[name] ?? 0) > 0)
    )

    for (const area of tree.areas) {
      for (const city of area.cities || []) {
        if (!citiesWithBuildings.has(city.name)) continue

        entries.push({
          url: `${baseUrl}${routes.condos}/${sanitizeUrl(city.name)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7
        })

        const hoodNames = (city.neighborhoods || [])
          .map((h) => h.name)
          .filter(Boolean) as string[]
        const hoodCounts = hoodNames.length
          ? await fetchHoodBuildingCounts(city.name, hoodNames)
          : {}

        for (const hood of city.neighborhoods || []) {
          if ((hoodCounts[hood.name] ?? 0) === 0) continue

          entries.push({
            url: `${baseUrl}${routes.condos}/${sanitizeUrl(city.name)}/${sanitizeUrl(hood.name)}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6
          })
        }
      }
    }

    return entries
  } catch (error) {
    logError('[condos sitemap] generation failed:', error)
    if (transient(error)) throw error
    return []
  }
}
