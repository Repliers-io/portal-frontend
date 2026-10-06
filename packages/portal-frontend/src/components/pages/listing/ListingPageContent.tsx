/**
 * PDP content: header, main content (gallery + detail sections), the agent-contact sidebar,
 * and the gallery/slideshow dialogs — each block gated by `listings.components`. Logs the
 * view to recently-viewed.
 * Anatomy: docs → product-guide/listing-detail/technical.
 */
'use client'

import React, { useEffect } from 'react'

import { Container, Stack } from '@mui/material'

import listingsConfig from '@configs/listings'
import mapConfig from '@configs/map'
import {
  FullscreenGalleryDialog,
  FullscreenRibbonDialog,
  GalleryDialog,
  SlideshowDialog
} from '@shared/Dialogs'

import { useListing } from 'providers/ListingProvider'
import { useUser } from 'providers/UserProvider'
import useAnalytics from 'hooks/useAnalytics'
import useRecents from 'hooks/useRecents'

import {
  ListingContactForm,
  ListingFooter,
  ListingHeader,
  ListingMainContent,
  ListingSidebarContainer
} from './components'

const ListingPageContent = ({
  embedded = false,
  mapType = 'interactive'
}: {
  embedded?: boolean
  mapType?: 'interactive' | 'static'
}) => {
  const { agentRole } = useUser()
  const { listing } = useListing()
  const trackEvent = useAnalytics()
  const { addRecent } = useRecents()
  const { sidebar, gridGallery, slideshow, fullscreenGallery } =
    listingsConfig.components

  useEffect(() => {
    const { mlsNumber: mls, boardId } = listing
    trackEvent('view_property_page', { mls, boardId })
    addRecent(listing)
  }, [])

  if (mapConfig.provider === 'google') {
    // eslint-disable-next-line no-param-reassign
    mapType = 'static'
    // WARN: Google Maps only supports static maps for now.
    // Should be extended in the future.
  }

  return (
    <Stack spacing={2} pb={4}>
      <ListingHeader embedded={embedded} />

      <Container>
        <Stack
          spacing={4}
          width="100%"
          alignItems="flex-start"
          justifyContent="space-between"
          direction={{ xs: 'column', md: 'row' }}
        >
          <ListingMainContent mapType={mapType} />

          {sidebar && !agentRole && (
            <ListingSidebarContainer embedded={embedded}>
              <ListingContactForm />
            </ListingSidebarContainer>
          )}
        </Stack>

        {gridGallery && <GalleryDialog />}
        {slideshow && <SlideshowDialog />}
        {fullscreenGallery && <FullscreenRibbonDialog />}
        {fullscreenGallery && <FullscreenGalleryDialog />}
      </Container>

      <ListingFooter />
    </Stack>
  )
}

export default ListingPageContent
