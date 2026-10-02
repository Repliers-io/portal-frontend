'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack } from '@mui/material'

import { ListingCarousel } from '@shared/Listing'

import { type ApiListing, type ApiQueryParams } from 'services/API'
import SearchService, { type Filters } from 'services/Search'
import { soldDateDesc } from 'utils/listings'

export const FeaturedListings = () => {
  const [featured, setFeatured] = useState<ApiListing[]>([])
  const [recentlySold, setRecentlySold] = useState<ApiListing[]>([])
  const t = useTranslations('HomePage')

  const filters: Partial<ApiQueryParams & Filters> = {
    class: 'residential',
    minPrice: 1_000_000,
    resultsPerPage: 12
  }

  const soldFilters: Partial<ApiQueryParams & Filters> = {
    ...filters,
    listingStatus: 'sold',
    sortBy: soldDateDesc
  }

  const fetchFeatured = async () => {
    try {
      const response = await SearchService.fetchListings(
        { ...filters, sortBy: 'createdOnDesc' },
        true
      )
      if (response) setFeatured(response.listings)
    } catch (error) {
      console.error('Featured::Error fetching data', error)
    }
  }

  const fetchRecentlySold = async () => {
    try {
      const response = await SearchService.fetchListings(soldFilters, true)
      if (response) setRecentlySold(response.listings)
    } catch (error) {
      console.error('RecentlySold::Error fetching data', error)
    }
  }

  useEffect(() => {
    fetchFeatured()
    fetchRecentlySold()
  }, [])

  return (
    <Container maxWidth="lg">
      <Stack spacing={0} pt={4}>
        <ListingCarousel title={t('justListed')} listings={featured} />
        <ListingCarousel title={t('recentlySold')} listings={recentlySold} />
      </Stack>
    </Container>
  )
}
