'use client'

import { Box, Stack } from '@mui/material'

import features from '@configs/features'

import { LinkBehavior } from 'components/atoms/LinkBehavior'

import { type ApiListing } from 'services/API'
import { useUser } from 'providers/UserProvider'
import { getSeoUrl, restrictedToGuest } from 'utils/listings'

import { FavoritesButton, Tags, TagsContainer } from '../ListingCard/components'
import { useListingTags } from '../ListingCard/useListingTags'

import {
  DrawerContent,
  DrawerGallery,
  DrawerRestrictedMessage
} from './components'
import { cardHeight } from './constants'

// Horizontal (drawer-shaped) listing card: gallery + content laid out in a row,
// with the tags overlay and favorites button. Self-sufficient given a listing —
// the map drawer wraps it with the surface context and its own loading shell.
export const DrawerListingCard = ({ listing }: { listing: ApiListing }) => {
  const { logged } = useUser()
  const tags = useListingTags(listing)
  const blurred =
    features.blurRestrictedProperty && restrictedToGuest(listing, logged)

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        component={LinkBehavior}
        href={getSeoUrl(listing)}
        direction="row"
        sx={{
          color: 'inherit',
          height: cardHeight,
          overflow: 'hidden',
          textDecoration: 'none'
        }}
      >
        <DrawerGallery listing={listing} blurred={blurred} />
        <DrawerContent listing={listing} />
      </Stack>

      <TagsContainer size="drawer">
        <Tags listing={listing} tags={tags} />
      </TagsContainer>

      {features.favorites && <FavoritesButton listing={listing} />}

      {blurred && <DrawerRestrictedMessage />}
    </Box>
  )
}
