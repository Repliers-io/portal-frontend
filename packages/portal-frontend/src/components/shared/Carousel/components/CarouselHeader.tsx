import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

import { WidgetHtmlText } from '@shared/CmsWidgets/components'

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
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        {typeof title === 'string' ? (
          <Typography
            noWrap={!subtitle}
            variant={size === 'small' ? 'h3' : 'h2'}
            sx={{ mr: { xs: navigation && subtitle ? -6 : 0, sm: 0 } }}
          >
            <WidgetHtmlText>{title}</WidgetHtmlText>
          </Typography>
        ) : (
          <Box>{title}</Box>
        )}
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            <WidgetHtmlText>{subtitle}</WidgetHtmlText>
          </Typography>
        )}
      </Stack>
      {navigation && (
        <CarouselNavigation size={size} onPrev={onPrev} onNext={onNext} />
      )}
    </Stack>
  )
}
