'use client'

import { Box, Chip, Link, Stack, Typography } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import i18nConfig from '@configs/i18n'

import useResponsiveValue from 'hooks/useResponsiveValue'

const cardWidth = Number(gridConfig.listingCardSizes.medium.width)
const distanceUnit = i18nConfig.measurementSystem === 'metric' ? 'km' : 'mi'

export const GroupTemplate = ({
  title,
  items,
  direction,
  maxColumns
}: {
  title: string
  items: {
    name: string
    link: string
    count?: number
    distance?: number
  }[]
  direction?: 'row' | 'column'
  maxColumns?: number
}) => {
  const responsive = useResponsiveValue({ xs: 2, sm: 2, md: 3, lg: 4 }) || 4
  const columns = maxColumns ? Math.min(responsive, maxColumns) : responsive
  // On mobile let columns split evenly (50%); keep the card-width floor from sm up
  const columnMin = useResponsiveValue({ xs: 0, sm: cardWidth }) ?? cardWidth
  const rowLength = Math.ceil(items.length / columns)

  if (!items.length) return null

  return (
    <Stack width="100%" spacing={4} pb={{ xs: 4, sm: 6 }}>
      <Typography variant="h4">{title}</Typography>
      <Box
        sx={{
          gap: 1,
          columnGap: 4,
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(${columnMin}px, 1fr))`,
          ...(direction === 'column'
            ? {
                gridTemplateRows: `repeat(${rowLength}, 1fr)`,
                gridAutoFlow: 'column'
              }
            : {})
        }}
      >
        {items.map(({ name, link, distance = 0, count = 0 }, index) => {
          const displayDistance =
            distanceUnit === 'mi' ? distance * 0.621371 : distance
          return (
            <Typography key={index} variant="body2" noWrap>
              {/* Plain anchor — full navigation to the server-rendered location page. */}
              <Link component="a" href={link}>
                {name.replaceAll('/', ' / ')}

                {count > 0 && (
                  <Chip
                    component="span"
                    label={count}
                    size="small"
                    sx={{ fontSize: 12, ml: 1, px: 0, width: 'fit-content' }}
                  />
                )}

                {distance > 0 && (
                  <Box component="span" sx={{ color: '#999' }}>
                    {' '}
                    (
                    {Number(displayDistance).toFixed(
                      displayDistance <= 2 ? 1 : 0
                    )}
                    {distanceUnit})
                  </Box>
                )}
              </Link>
            </Typography>
          )
        })}
      </Box>
    </Stack>
  )
}
