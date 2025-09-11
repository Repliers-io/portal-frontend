'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack } from '@mui/material'

import { PropertyCarousel } from '@shared/Property'

import { type ApiQueryParams, type Property } from 'services/API'
import SearchService from 'services/Search'

const FeaturedProperties = () => {
  const [featured, setFeatured] = useState<Property[]>([])
  const [recentlySold, setRecentlySold] = useState<Property[]>([])
  const t = useTranslations('HomePage')

  const filters: Partial<ApiQueryParams> = {
    class: 'residential',
    minPrice: 1_000_000,
    resultsPerPage: 12
  }

  const soldFilters: Partial<ApiQueryParams> = {
    ...filters,
    status: 'U',
    sortBy: 'soldDateDesc'
  }

  const fetchFeatured = async () => {
    try {
      const response = await SearchService.fetchListings(filters)
      if (response) setFeatured(response.listings)
    } catch (error) {
      console.error('Featured::Error fetching data', error)
    }
  }

  const fetchRecentlySold = async () => {
    try {
      const response = await SearchService.fetchListings(soldFilters)
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
      <Stack spacing={6} py={8}>
        <PropertyCarousel title={t('justListed')} properties={featured} />
        <PropertyCarousel title={t('recentlySold')} properties={recentlySold} />
      </Stack>
    </Container>
  )
}

export default FeaturedProperties
