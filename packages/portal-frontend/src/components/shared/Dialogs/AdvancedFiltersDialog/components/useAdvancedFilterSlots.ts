import filtersConfig from '@configs/filters'
import { type AdvancedFilterSlot } from '@defaults/filters'

import useBreakpoints from 'hooks/useBreakpoints'

// On mobile, bar filter slots are hidden from the bar and prepended to the
// advanced filters dialog so users can still access them.
export const useAdvancedFilterSlots = (): AdvancedFilterSlot[] => {
  const { mobile } = useBreakpoints()
  const barSlots = filtersConfig.barFilterSlots ?? []

  return mobile
    ? [...barSlots, ...filtersConfig.advancedFilterSlots]
    : [...filtersConfig.advancedFilterSlots]
}
