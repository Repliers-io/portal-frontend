import { type MetadataRoute } from 'next'

import features from '@configs/features'
import { getBuildingUrl } from '@pages/condos/utils'

import {
  fetchAllBuildingsForCity,
  fetchCityBuildingCounts,
  topCitiesForBuildings
} from 'app/condos/_utils'

import { transient } from 'services/API'
import { loadStaticTree } from 'services/LocationsTree'
import { logError } from 'utils/log'

export const revalidate = 86400

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!features.buildings) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const { tree } = await loadStaticTree()

    const allCities = tree.areas.flatMap((area) => area.cities || [])
    const topCityNames = allCities
      .filter((c) => c.activeCount)
      .sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0))
      .slice(0, topCitiesForBuildings)
      .map((c) => c.name)

    const cityCounts = await fetchCityBuildingCounts(topCityNames)
    const citiesWithBuildings = topCityNames.filter(
      (name) => (cityCounts[name] ?? 0) > 0
    )

    const allBuildings = (
      await Promise.all(
        citiesWithBuildings.map((city) =>
          fetchAllBuildingsForCity(city).catch((error) => {
            logError(`[condo sitemap] buildings for ${city} failed:`, error)
            if (transient(error)) throw error
            return []
          })
        )
      )
    ).flat()

    return allBuildings.map((building) => ({
      url: `${baseUrl}${getBuildingUrl(building)}`.replace(/&/g, '%26'),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }))
  } catch (error) {
    logError('[condo sitemap] generation failed:', error)
    if (transient(error)) throw error
    return []
  }
}
