import React from 'react'
import { useTranslations } from 'next-intl'

import listingsConfig from '@configs/listings'
import { NavigationBar } from '@shared/NavigationBar'

import { useListing } from 'providers/ListingProvider'
import { detailsAvailable } from 'utils/listings'

import { LeftSideButtons, RightSideButtons } from './components'

const { listingBrowserContainerId, navigationItems } = listingsConfig
const { static: staticBarOffset, embedded: embeddedBarOffset } =
  listingsConfig.barOffset

export const ListingNavigationBar = ({
  embedded = false
}: {
  embedded?: boolean
}) => {
  const t = useTranslations()
  const { listing, blurred } = useListing()
  // wait for the navigation bar to render items only if the raw data is available (second / full-data fetch was made)
  const loaded = detailsAvailable(listing)
  const barOffset = embedded ? embeddedBarOffset : staticBarOffset

  const items = navigationItems.map((item) => ({
    id: item.id,
    label: t(`PDP.sections.${item.id}.name`)
  }))

  return (
    <NavigationBar
      items={items}
      loaded={loaded}
      embedded={embedded}
      barOffset={barOffset}
      containerId={listingBrowserContainerId}
      {...(!blurred && {
        slots: {
          left: LeftSideButtons,
          right: RightSideButtons
        },
        stickyOffsets: {
          left: barOffset,
          right: barOffset + 90
        }
      })}
    />
  )
}
