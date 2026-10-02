'use client'

import {
  Box,
  Grid,
  Pagination,
  PaginationItem,
  Stack,
  Typography
} from '@mui/material'

import { LinkBehavior } from 'components/atoms/LinkBehavior'

import { type WpMediaItem } from 'services/CMS/clients/WordPressClient/types'
import { pluralize } from 'utils/strings'

import { CmsBuildingCard, EmptyBuildings } from './components'

type BuildingItem = {
  building: {
    id: number
    name: string
    slug: string
    link?: string
    acf?: {
      slideshow?: number[]
      map?: { address?: string }
    }
  }
  media: WpMediaItem | null
}

type BuildingsIndexContentProps = {
  buildings: BuildingItem[]
  page: number
  total: number
  perPage: number
  baseUrl: string
}

export const BuildingsIndexContent = ({
  buildings,
  page,
  total,
  perPage,
  baseUrl
}: BuildingsIndexContentProps) => {
  if (buildings.length === 0 && page === 1) return <EmptyBuildings />

  const numPages = Math.ceil(total / perPage)

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  const buildPageUrl = (p: number) =>
    p <= 1 ? baseUrl : `${baseUrl}?page=${p}`

  return (
    <Stack spacing={4}>
      <Typography variant="h6" noWrap>
        {total.toLocaleString('en-GB')}{' '}
        <Typography variant="body2" component="span" color="text.hint">
          {pluralize(total, { one: 'building', many: 'buildings' })}
        </Typography>
        {numPages > 1 && (
          <Typography variant="body2" component="span" color="text.hint">
            {' '}
            · showing {from} – {to}
          </Typography>
        )}
      </Typography>

      <Grid container spacing={4}>
        {buildings.map(({ building, media }) => (
          <Grid key={building.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CmsBuildingCard building={building} media={media} />
          </Grid>
        ))}
      </Grid>

      {numPages > 1 && (
        <Box textAlign="center">
          <Pagination
            size="small"
            siblingCount={1}
            boundaryCount={1}
            page={page}
            count={numPages}
            renderItem={(item) => {
              const { variant: _, ...rest } = item
              return (
                <PaginationItem
                  component={LinkBehavior}
                  href={buildPageUrl(item.page ?? 1)}
                  {...rest}
                />
              )
            }}
            sx={{ display: 'inline-block' }}
          />
        </Box>
      )}
    </Stack>
  )
}
