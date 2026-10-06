'use client'

import React from 'react'

import { Stack, Typography } from '@mui/material'

import listingsConfig from '@configs/listings'
import { ShareButton } from '@shared/Buttons'
import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { useBuilding } from 'providers/BuildingProvider'
import { formatFullAddress } from 'utils/listings'

export const BuildingHeaderInfo = () => {
  const { name, address, map, description } = useBuilding()

  const subtitle =
    map?.address || (address ? formatFullAddress(address as any) : undefined)

  return (
    <Stack spacing={4}>
      <Stack
        spacing={4}
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack spacing={1}>
          {name && (
            <Typography variant="h1" fontSize={56} color="secondary.dark">
              {name}
            </Typography>
          )}

          {subtitle && (
            <Typography variant="h5" color="primary.main">
              {subtitle}
            </Typography>
          )}
        </Stack>

        {listingsConfig.components.share && (
          <ShareButton variant="outlined" title={name} />
        )}
      </Stack>

      {description && <CmsContentRenderer content={description} />}
    </Stack>
  )
}
