import React from 'react'
import Image from 'next/legacy/image'

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
    title: '20+ Years',
    text: 'Serving Calgary residents'
  },
  {
    icon: <IcoHouse />,
    title: '11,000+',
    text: 'Happy families helped'
  },
  {
    icon: <IcoRocket />,
    title: '$4.5 bn+',
    text: 'Sales volume'
  },
  {
    icon: <IcoStar />,
    title: '2700+',
    text: '5 star reviews'
  }
]

const TeamStatsBanner = () => {
  return (
    <Paper>
      <Grid container flexDirection="row">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box py={2.5} pl={{ xs: 3, md: 5 }} pr={3}>
            <Typography
              variant="h2"
              color="text.primary"
              lineHeight={toRem(38)}
            >
              We know real estate
            </Typography>
            <Stack mt={0.5}>
              <Typography
                variant="h4"
                color="text.primary"
                fontSize={toRem(20)}
              >
                #1 Team in Canada{' '}
                <Typography
                  component="span"
                  color="primary.main"
                  fontWeight="bold"
                >
                  *
                </Typography>
              </Typography>
              <Typography
                variant="h4"
                color="text.primary"
                fontSize={toRem(20)}
              >
                #1 Team in the World{' '}
                <Typography
                  component="span"
                  color="primary.main"
                  fontWeight="bold"
                >
                  **
                </Typography>
              </Typography>
            </Stack>
            <Stack mt={2}>
              <Typography
                variant="caption"
                display="block"
                fontSize={toRem(12)}
              >
                * 2024 Production Volume & Units Sold
              </Typography>
              <Typography
                variant="caption"
                display="block"
                fontSize={toRem(12)}
              >
                ** 2024 Units Sold
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
                bgcolor: 'primary.main',
                opacity: 0.6
              }
            }}
          >
            <Image
              unoptimized
              layout="fill"
              objectFit="cover"
              objectPosition="left center"
              src="/justinhavre-avm/team-stats-banner.webp"
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
