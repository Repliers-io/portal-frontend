import React, { Suspense } from 'react'
import Image from 'next/legacy/image'

import { Box, Container, Stack, Typography } from '@mui/material'

import content from '@configs/content'
import { Autosuggestion } from '@templates/Header/components'
import IcoSearch from '@icons/IcoSearch'

const { siteSplashscreen, siteName } = content

const HomePageBanner = ({
  title = '',
  subtitle = '',
  children
}: {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}) => {
  return (
    <Box bgcolor="common.black" position="relative">
      <Box width="100%" height="100%" position="absolute" sx={{ opacity: 0.8 }}>
        <Image
          unoptimized
          layout="fill"
          loading="lazy"
          priority={false}
          objectFit="cover"
          objectPosition="center"
          src={siteSplashscreen}
          alt={siteName}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack
          sx={{ py: { xs: 6, sm: 8, md: 10 } }}
          width="100%"
          spacing={6}
          alignItems="center"
          justifyContent="center"
        >
          <Stack spacing={1.5}>
            {title && (
              <Typography
                variant="h1"
                textAlign="center"
                color="common.white"
                sx={{
                  px: { md: 8, lg: 12 },
                  lineHeight: { xs: 1, md: 1 },
                  textShadow: '0 0 10px rgba(0,0,0,0.3)'
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="h4"
                color="#DDDDDD"
                fontWeight={400}
                textAlign="center"
                sx={{
                  textShadow: {
                    xs: '0 0 0px rgba(0,0,0,0.1)',
                    sm: '0 0 2px rgba(0,0,0,0.3)'
                  }
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Stack>
          <Box
            sx={{
              height: 56,
              width: { xs: '100%', sm: 640 },
              bgcolor: 'background.paper',
              '& .MuiAutocomplete-root .MuiFilledInput-root': {
                bgcolor: 'white !important',
                height: 56
              },
              '& .MuiButton-root': {
                height: 56
              }
            }}
          >
            <Suspense>
              <Stack direction="row" sx={{ width: '100%', height: '100%' }}>
                <Box
                  sx={{
                    pl: 3,
                    pr: 1,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <IcoSearch color="#AAAAAA" />
                </Box>

                <Autosuggestion
                  showButton
                  buttonTitle={
                    <Box
                      px={{ xs: 3, sm: 6, md: 8 }}
                      fontSize={{ xs: '1rem', sm: '1.25rem' }}
                    >
                      SEARCH
                    </Box>
                  }
                />
              </Stack>
            </Suspense>
          </Box>
        </Stack>
      </Container>
      {children}
    </Box>
  )
}

export default HomePageBanner
