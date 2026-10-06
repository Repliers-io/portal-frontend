import { type MetadataRoute } from 'next'

import features from '@configs/features'
import locationConfig from '@configs/location'

import { getAreaUrl, loadStaticTree } from 'services/LocationsTree'
import { getLocationUrl } from 'utils/urls'

export const revalidate = 3600

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!features.locations) return []
  if (process.env.DISABLE_SSG === 'true') return []

  try {
    const { tree } = await loadStaticTree()

    const entries: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}${getLocationUrl()}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9
      }
    ]

    if (locationConfig.showAreas) {
      for (const area of tree.areas) {
        entries.push({
          // Areas are published at their short URL — see getAreaUrl.
          url: `${baseUrl}${getAreaUrl(tree, area.name)}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8
        })
      }
    }

    for (const area of tree.areas) {
      for (const city of area.cities || []) {
        entries.push({
          url: `${baseUrl}${getLocationUrl({ city: city.name })}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7
        })

        for (const hood of city.neighborhoods || []) {
          entries.push({
            url: `${baseUrl}${getLocationUrl({ city: city.name, hood: hood.name })}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.6
          })
        }
      }
    }

    return entries
  } catch {
    return []
  }
}
