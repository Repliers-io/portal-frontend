import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

// The MapTitle bar shows when there is a title, a selected location, or a point.
// Shared so a top-anchored controls stack can reserve space for the bar only
// while it is actually visible.
export const useMapTitleVisible = (): boolean => {
  const { title } = useMapOptions()
  const { locations } = useMapLocations()
  const { point } = useSearch()

  return !!(title || locations?.length || point)
}
