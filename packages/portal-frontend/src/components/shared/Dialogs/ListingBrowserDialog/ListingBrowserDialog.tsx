import { DialogContent } from '@mui/material'

import ListingPageContent from '@pages/listing'

import { ContentShadow, LoadingView } from 'components/atoms'

import { type ApiListing } from 'services/API'
import ListingDetailsProvider from 'providers/ListingDetailsProvider'
import ListingProvider from 'providers/ListingProvider'
import { LiveByDemographicsProvider } from 'providers/LiveByDemographicsProvider'

import { DialogCloseButton, DialogDrawer } from '../components'

import {
  ListingBrowserTitle,
  NavigationControls,
  StaticPageButton
} from './components'
import { dialogName } from './constants'
import { useListingBrowser, useListingDemographics } from './hooks'

export const ListingBrowserDialog = ({
  active,
  mapType = 'interactive',
  listings
}: {
  active: number
  mapType?: 'interactive' | 'static'
  listings: ApiListing[]
}) => {
  const {
    cachedListing,
    activeListing,
    scrollY,
    handleScroll,
    contentRef,
    prev,
    next,
    propertyKey,
    handleNavigationClick,
    hideDialog
  } = useListingBrowser({ active, listings })
  const demographics = useListingDemographics(activeListing)

  return (
    <DialogDrawer
      dialogName={dialogName}
      maxWidth={{ xs: '100%', lg: 1296 }}
      labelledBy={`${dialogName}-title`}
    >
      {cachedListing ? (
        <ListingProvider key={propertyKey} listing={cachedListing}>
          <ListingDetailsProvider listing={cachedListing}>
            <DialogCloseButton onClose={hideDialog} />
            <StaticPageButton />
            <NavigationControls
              next={next}
              prev={prev}
              onClick={handleNavigationClick}
            />
            <ListingBrowserTitle
              listing={cachedListing}
              id={`${dialogName}-title`}
            />
            <ContentShadow visible={scrollY > 0} />
            <DialogContent
              ref={contentRef}
              onScroll={handleScroll}
              id={`${dialogName}-content`}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: '8px !important'
              }}
            >
              <LiveByDemographicsProvider demographics={demographics}>
                <ListingPageContent embedded mapType={mapType} />
              </LiveByDemographicsProvider>
            </DialogContent>
          </ListingDetailsProvider>
        </ListingProvider>
      ) : (
        <DialogContent>
          <LoadingView />
        </DialogContent>
      )}
    </DialogDrawer>
  )
}
