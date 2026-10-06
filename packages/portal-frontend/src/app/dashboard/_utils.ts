import { cache } from 'react'

import { type PropertyClass } from '@configs/filters'
import locationConfig from '@configs/location'

import { APIWidgets, transient } from 'services/API'
import { loadStaticTree } from 'services/LocationsTree/static'
import { cityGeoFilters } from 'utils/filters'
import { logError } from 'utils/log'
import { beautify, sanitizeUrl } from 'utils/urls'

export const getValidCity = (slug: string): string => {
  const cityName = beautify(slug)

  return (
    locationConfig.defaultCities.find(
      (city: string) => city.toLowerCase() === cityName.toLowerCase()
    ) ?? cityName
  )
}

export const getAllCitySlugs = (): string[] =>
  locationConfig.defaultCities.map(sanitizeUrl)

export const fetchWidgetStats = cache(
  async (city: string, propertyClass: PropertyClass) => {
    try {
      return await APIWidgets.fetchStats({
        ...cityGeoFilters(city),
        propertyClass
      })
    } catch (error) {
      logError('[fetchWidgetStats] error:', error)
      if (transient(error)) throw error
      return null
    }
  }
)

export const fetchMoreCities = async ({
  limit,
  exclude = []
}: {
  limit: number
  exclude?: string[]
}) => {
  const { tree } = await loadStaticTree()
  const excluded = new Set(exclude.map((c) => c.toLowerCase()))

  const cities = tree.areas
    .flatMap((a) => a.cities)
    .map((c) => ({
      name: c.name,
      key: c.name.toLowerCase(),
      activeCount: c.activeCount || 0
    }))

  const countMap = new Map(
    cities.map(({ key, activeCount }) => [key, activeCount])
  )

  const defaultsNorm = (locationConfig.defaultCities as string[]).map(
    (name) => ({
      name,
      key: name.toLowerCase()
    })
  )
  const defaultSet = new Set(defaultsNorm.map(({ key }) => key))

  const defaults = defaultsNorm
    .filter(({ key }) => !excluded.has(key))
    .map(({ name, key }) => ({ name, activeCount: countMap.get(key) || 0 }))

  const nonDefaults = cities
    .filter(({ key }) => !defaultSet.has(key) && !excluded.has(key))
    .sort((a, b) => b.activeCount - a.activeCount)
    .map(({ name, activeCount }) => ({ name, activeCount }))

  return [...defaults, ...nonDefaults].slice(0, limit)
}
