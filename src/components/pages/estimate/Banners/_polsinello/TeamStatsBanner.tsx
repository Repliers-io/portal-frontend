import React from 'react'
import Image from 'next/image'

import { Box, Paper, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import IcoHouse from '@icons/IcoHouse'
import IcoPeople from '@icons/IcoPeople'
import IcoRocket from '@icons/IcoRocket'
import IcoStar from '@icons/IcoStar'

import { toRem } from 'utils/theme'

const stats: Array<{
  icon: React.ReactNode
  title: string
  text: string
}> = [
  {
    icon: <IcoPeople />,
    title: '36+ Years',
    text: 'Serving GTA residents'
  },
  {
    icon: <IcoHouse />,
    title: '5000+',
    text: 'Families Helped'
  },
  {
    icon: <IcoRocket />,
    title: '$3.0B',
    text: 'Sales Volume'
  },
  {
    icon: <IcoStar />,
    title: '1120+',
    text: '5 Star Reviews'
  }
]

const TeamStatsBanner = () => {
  return (
    <Paper>
      <Grid container flexDirection="row">
        <Grid size={{ xs: 12, md: 6 }} display="flex">
          <Box
            my="auto"
            py={2.5}
            pl={{ xs: 3, md: 5 }}
            pr={3}
            boxSizing="border-box"
          >
            <Stack>
              <Typography variant="h3" color="text.primary">
                Sell Your Home With Confidence
              </Typography>
            </Stack>
            <Stack mt={1}>
              <Typography variant="body1" display="block">
                Using our proven processes and experience.
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} position="relative" minHeight={180}>
          <Box
            width="100%"
            height="100%"
            position="absolute"
            bgcolor="background.paper"
            zIndex={0}
            sx={{
              '&::after': {
                content: '""',
                display: 'block',
                position: 'absolute',
                inset: 0,
                bgcolor: 'secondary.main',
                opacity: 0.6
              }
            }}
          >
            <Image
              unoptimized
              layout="fill"
              objectFit="cover"
              objectPosition="left center"
              src="/polsinello/team-stats-banner.webp"
              alt="City banner picture"
            />
          </Box>

          <Stack
            direction="row"
            display="grid"
            gap={2.5}
            py={2.5}
            pl={{ xs: 3, md: 4.5 }}
            pr={3}
            position="relative"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr'
            }}
          >
            {stats.map(({ icon, title, text }) => {
              return (
                <Stack
                  direction="row"
                  gap={2.5}
                  alignItems="center"
                  key={title}
                >
                  {icon}
                  <Stack direction="column">
                    <Typography
                      variant="h2"
                      color="common.white"
                      lineHeight={toRem(38)}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="common.white"
                      fontSize={toRem(16)}
                      lineHeight={toRem(22)}
                    >
                      {text}
                    </Typography>
                  </Stack>
                </Stack>
              )
            })}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TeamStatsBanner
