'use client'

import React from 'react'

import { Typography } from '@mui/material'

import {
  type ListingLastStatus,
  listingLastStatusMapping
} from '@configs/properties'
import { PropertyCarousel } from '@shared/Property'

import { FullscreenView } from 'components/atoms'

import { type Property } from 'services/API'
import { formatFullAddress, parseSeoUrl } from 'utils/properties'

import { PageTemplate } from '.'

const phrases = {
  404: "We're sorry. The listing you are looking for isn't there.",
  403: 'Access denied. You are not authorized to view this listing.',
  410: 'The listing you are looking for was $. ',
  500: 'An unexpected error occurred. Please try again later.'
}

type ErrorCode = keyof typeof phrases

export const extractLastStatus = (message?: string, divider = '. ') => {
  if (!message) return null
  const lastStatus = message.includes(divider)
    ? message.split(divider)[1]
    : message
  return listingLastStatusMapping[lastStatus as ListingLastStatus]
}

const Property40XTemplate = ({
  listingName,
  properties = [],
  error
}: {
  listingName: string
  properties?: Property[]
  error?: any
}) => {
  const { status = 404, data } = error || {}

  const parsedAddress = parseSeoUrl(listingName)
  const restoredAddress = formatFullAddress(parsedAddress)
  const lastStatus = extractLastStatus(data?.userMessage || data?.message)

  let subtitle = phrases[status as ErrorCode] || phrases[404]
  if (status === 410) {
    if (lastStatus) {
      subtitle = subtitle.replace('$', lastStatus.toLowerCase())
    } else {
      // reset to general 404 message
      subtitle = phrases[404]
    }
  }

  const showNearbies = properties.length > 0

  return (
    <PageTemplate bgcolor="background.default">
      <FullscreenView title={status} subtitle={subtitle}>
        {showNearbies && (
          <>
            <Typography>
              Fortunatelly, we have other active listings near
              <br />
              <b>{restoredAddress}</b>
              <br /> Check them out!
            </Typography>
            <PropertyCarousel properties={properties} />
          </>
        )}
      </FullscreenView>
    </PageTemplate>
  )
}

export default Property40XTemplate
