'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@mui/material'

import { EmptyListings } from '@shared/EmptyStates'
import { ListingCarousel } from '@shared/Listing'

import { type ApiListing, type ApiQueryParams } from 'services/API'
import SearchService, { type Filters } from 'services/Search'
import useBreakpoints from 'hooks/useBreakpoints'
import {
  calcZoomLevelForBounds,
  getCombinedBounds,
  getMapUrl,
  toMapboxBounds
} from 'utils/map'

import { WidgetWrapper } from '../WidgetWrapper'

export interface CarouselWidgetProps {
  title?: string
  subtitle?: string
  buttonTitle?: string
  size?: 'small' | 'medium' | 'large'
  listings?: Partial<ApiQueryParams & Filters>
  bgcolor?: string
}

export const CarouselWidget = ({
  title,
  subtitle,
  size = 'medium',
  buttonTitle,
  listings: filters,
  bgcolor
}: CarouselWidgetProps) => {
  const { mobile } = useBreakpoints()
  const [listingItems, setListingItems] = useState<ApiListing[]>([])
  const [loading, setLoading] = useState(true)

  // the map link carries the widget's filters, not its page size
  const mapFilters = { ...filters, resultsPerPage: undefined }
  const [mapLink, setMapLink] = useState(() =>
    getMapUrl({ filters: mapFilters })
  )

  const fetchListings = async () => {
    try {
      setLoading(true)
      const response = await SearchService.fetchListings(
        { resultsPerPage: 8, ...filters, aggregates: 'map' },
        true
      )
      if (response) {
        setListingItems(response.listings || [])
        const clusters = response.aggregates?.map?.clusters
        if (clusters?.length) {
          const combined = getCombinedBounds(
            clusters.map((c) => toMapboxBounds(c.bounds))
          )
          if (combined) {
            const zoom = calcZoomLevelForBounds(combined, 640, 480)
            setMapLink(
              getMapUrl({
                filters: mapFilters,
                center: combined.getCenter(),
                zoom
              })
            )
          }
        }
      }
    } catch (error) {
      console.error('CarouselWidget::Error fetching data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  return (
    <WidgetWrapper
      maxWidth="lg"
      bgcolor={bgcolor}
      sx={{
        pt: !title && !subtitle ? { xs: 2, sm: 2, md: 2 } : subtitle ? 5 : 6,
        pb: buttonTitle ? 6 : { xs: 2, sm: 2, md: 2 },
        px: { xs: 0, lg: 0 }
      }}
    >
      {!loading && !listingItems.length ? (
        <EmptyListings />
      ) : (
        <>
          <ListingCarousel
            size={mobile ? 'medium' : size}
            title={title}
            subtitle={subtitle}
            listings={listingItems}
            centering={mobile}
          />
          {buttonTitle && (
            <Button
              variant="outlined"
              href={mapLink}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {buttonTitle}
            </Button>
          )}
        </>
      )}
    </WidgetWrapper>
  )
}
