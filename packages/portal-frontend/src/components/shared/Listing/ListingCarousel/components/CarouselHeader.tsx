import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

import { CarouselNavigation } from '.'

export const CarouselHeader = ({
  size,
  title,
  subtitle,
  navigation,
  onPrev,
  onNext
}: {
  size: 'small' | 'medium' | 'large'
  title: string | React.ReactNode
  subtitle?: string
  navigation: boolean
  onPrev: () => void
  onNext: () => void
}) => {
  return (
    <Stack
      className="carousel-header"
      width="100%"
      spacing={2}
      direction="row"
      alignItems={{ xs: 'flex-end', sm: subtitle ? 'flex-end' : 'center' }}
      sx={{ minHeight: size === 'small' ? 38 : 48 }}
    >
      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {typeof title === 'string' ? (
          <Typography variant={size === 'small' ? 'h3' : 'h2'}>
            {title}
          </Typography>
        ) : (
          <Box>{title}</Box>
        )}
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {navigation && (
        <CarouselNavigation size={size} onPrev={onPrev} onNext={onNext} />
      )}
    </Stack>
  )
}
