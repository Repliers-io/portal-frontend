'use client'

import listingsConfig from '@configs/listings'
import { useNavigationBarLoading } from '@pages/building/hooks'
import { NavigationBar } from '@shared/NavigationBar'

import { useBuilding } from 'providers/BuildingProvider'

import { LeftSideButtons, RightSideButtons } from './components'

export const BuildingNavigationBar = () => {
  const barOffset = listingsConfig.barOffset.static
  const loaded = useNavigationBarLoading()
  const { navigationItems } = useBuilding()

  return (
    <NavigationBar
      items={navigationItems}
      barOffset={barOffset}
      loaded={loaded}
      slots={{
        left: LeftSideButtons,
        right: RightSideButtons
      }}
      stickyOffsets={{
        left: barOffset,
        right: barOffset + 90
      }}
    />
  )
}
