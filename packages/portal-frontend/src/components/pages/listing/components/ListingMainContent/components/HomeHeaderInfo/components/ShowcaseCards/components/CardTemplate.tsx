import React from 'react'
import Link from 'next/link'

import { Box, Stack, Typography } from '@mui/material'

import { cardWidth } from '../constants'

export const CardTemplate = ({
  url,
  icon,
  backgroundImage,
  bgcolor = 'grey.300',
  title,
  description
}: {
  url: string
  icon: React.ReactNode
  backgroundImage: string
  bgcolor?: string
  title: string
  description: string
}) => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        boxSizing: 'border-box',
        bgcolor: 'background.default',
        width: { xs: '100%', sm: cardWidth }
      }}
    >
      <Link href={url} target="_blank">
        <Box p={2}>
          <Stack direction="row" spacing={{ xs: 4, sm: 2 }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '128px',
                borderRadius: 2,
                aspectRatio: 3 / 2,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: `url(${backgroundImage})`,
                bgcolor,
                '& svg': {
                  filter: 'drop-shadow(0 0 10px #000)'
                }
              }}
            >
              {icon}
            </Box>
            <Stack>
              <Typography variant="h6" color="primary" sx={{ pb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2">{description}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Link>
    </Box>
  )
}
