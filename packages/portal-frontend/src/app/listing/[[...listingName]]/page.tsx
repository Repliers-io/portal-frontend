import React from 'react'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

import content from '@configs/content'
import features from '@configs/features'
import listingsConfig from '@configs/listings'
import {
  Listing40XTemplate,
  ListingPageTemplate,
  PageTemplate
} from '@templates'
import { TokenLoginHandler } from '@templates/components'
import { ListingProviders } from '@pages/listing/ListingProviders'

import { APILocations, transient } from 'services/API'
import { formatMetadata } from 'utils/listings'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './types'
import { fetchListing, fetchNearbies, parseParams } from './utils'

type ListingPageProps = {
  params: Params
  searchParams: SearchParams
}

// NextJS SSR metadata generation
export const generateMetadata = async (
  props: ListingPageProps
): Promise<Metadata> => {
  const searchParams = await props.searchParams
  const params = await props.params
  const host = getProtocolHost(await headers())
  const { listingId, boardId } = parseParams(params, searchParams)
  try {
    const listing = await fetchListing(listingId, boardId)
    return formatMetadata(listing, host)
  } catch (error) {
    const meta = content.pagesMeta.missingProperty ?? {}
    // The listing exists — the backend just failed to hand it over. The 40X page
    // still serves the visitor, but the crawler must not read that 200 as a real
    // miss and drop a live listing from the index.
    return transient(error)
      ? { ...meta, robots: { index: false, follow: true } }
      : meta
  }
}

const ListingPage = async (props: ListingPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { listingId, boardId, listingName } = parseParams(params, searchParams)
  const noHeader = !listingsConfig.components.header

  try {
    const listing = await fetchListing(listingId, boardId)

    const lat = Number(listing.map.latitude)
    const lng = Number(listing.map.longitude)

    const demographics =
      features.liveBy && lat && lng
        ? await APILocations.fetchLiveByDemographics(lat, lng)
        : null

    return (
      <PageTemplate noHeader={noHeader}>
        <TokenLoginHandler />
        <ListingProviders listingId={listingId} lat={lat} lng={lng}>
          <ListingPageTemplate listing={listing} demographics={demographics} />
        </ListingProviders>
      </PageTemplate>
    )
  } catch (error) {
    const listings = await fetchNearbies(listingName)
    return (
      <Listing40XTemplate
        listingName={listingName}
        listings={listings}
        error={error}
      />
    )
  }
}

export default ListingPage
