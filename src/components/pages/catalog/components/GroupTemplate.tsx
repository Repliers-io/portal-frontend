'use client'

import Link from 'next/link'

import { Box, Chip, Container, Stack, Typography } from '@mui/material'

import useResponsiveValue from 'hooks/useResponsiveValue'

const GroupTemplate = ({
  title,
  items,
  direction
}: {
  title: string
  items: {
    name: string
    link: string
    count?: number
    distance?: number
  }[]
  direction?: 'row' | 'column'
}) => {
  const columns = useResponsiveValue({ xs: 1, sm: 2, md: 3, lg: 4 }) || 4
  const rowLength = Math.ceil(items.length / columns)

  if (!items.length) return null

  return (
    <Container>
      <Stack width="100%" spacing={4} pb={{ xs: 4, sm: 6 }}>
        <Typography variant="h4">{title}</Typography>
        <Box
          sx={{
            gap: 1,
            columnGap: 6,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            ...(direction === 'column'
              ? {
                  gridTemplateRows: `repeat(${rowLength}, 1fr)`,
                  gridAutoFlow: 'column'
                }
              : {})
          }}
        >
          {items.map(({ name, link, distance = 0, count = 0 }, index) => (
            <Typography key={index} variant="body2" noWrap>
              <Link href={link}>
                {name.replaceAll('/', ' / ')}

                {count > 0 && (
                  <Chip
                    label={count}
                    size="small"
                    sx={{ fontSize: 12, ml: 1, px: 0 }}
                  />
                )}

                {distance > 0 && (
                  <Box component="span" sx={{ color: '#999' }}>
                    {' '}
                    ({Number(distance).toFixed(distance <= 2 ? 1 : 0)}km)
                  </Box>
                )}
              </Link>
            </Typography>
          ))}
        </Box>
      </Stack>
    </Container>
  )
}

export default GroupTemplate
