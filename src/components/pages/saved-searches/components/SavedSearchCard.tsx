import React from 'react'
import Link from 'next/link'
import queryString from 'query-string'

import { Box, Paper, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import routes from '@configs/routes'

import { type ApiSavedSearch } from 'services/API'
import { useSaveSearch } from 'providers/SaveSearchProvider'

import { MapImagePreview, SavedSearchFooter, SavedSearchHeader } from '.'

const { savedSearchCard } = gridConfig

const SavedSearchCard = ({ search }: { search: ApiSavedSearch }) => {
  const { editId, deleteId, processing } = useSaveSearch()
  const { searchId, map } = search
  const position = map[0]

  const cardProcessing =
    processing && (editId === searchId || deleteId === searchId)

  const linkParams = queryString.stringify({ searchId })
  const searchLink = `${routes.map}?${linkParams}`

  // WARN: expand image to crop Mapbox copyright text
  const imageHeight = Number(savedSearchCard.height) - 32
  const imageWidth = imageHeight

  return (
    <Paper
      elevation={1}
      sx={{
        width: {
          xs: 'auto',
          sm: Number(savedSearchCard.width)
        },
        opacity: cardProcessing ? 0.5 : 1
      }}
    >
      <Box p={2}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="stretch"
        >
          <Link href={searchLink}>
            <MapImagePreview
              position={position}
              width={imageWidth}
              height={imageHeight}
            />
          </Link>

          <Stack
            spacing={1}
            justifyContent="space-between"
            height={Number(savedSearchCard.height) - 32}
          >
            <Link href={searchLink}>
              <SavedSearchHeader search={search} />
            </Link>

            <SavedSearchFooter search={search} />
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}

export default SavedSearchCard
