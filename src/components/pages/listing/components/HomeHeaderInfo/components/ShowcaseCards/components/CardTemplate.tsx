import React from 'react'
import Link from 'next/link'

import { Box, Stack, Typography } from '@mui/material'

const CardTemplate = ({
  url,
  icon,
  backgroundImage,
  title,
  description
}: {
  url: string
  icon: React.ReactNode
  backgroundImage: string
  title: string
  description: string
}) => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        boxSizing: 'border-box',
        bgcolor: 'background.default',
        width: { xs: '100%', sm: 275 }
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
                bgcolor: 'grey.300',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: `url(${backgroundImage})`,
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

export default CardTemplate
