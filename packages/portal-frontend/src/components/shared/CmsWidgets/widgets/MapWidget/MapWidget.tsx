'use client'

import { Suspense } from 'react'

import { Container, Stack, Typography } from '@mui/material'

import MapOptionsProvider from 'providers/MapOptionsProvider'

import { WidgetHtmlText } from '../../components'

import {
  MapWidgetContent,
  type MapWidgetContentProps
} from './MapWidgetContent'

export interface MapWidgetProps extends MapWidgetContentProps {
  /**
   * Map width – a pixel value (number) or MUI breakpoint key ('xs' | 'sm' | 'md' | 'lg' | 'xl').
   * Defaults to 'lg' (1200 px).
   */
  width?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Optional title rendered above the map.
   */
  title?: string
  /**
   * Optional subtitle rendered below the title.
   */
  subtitle?: string
}

// ── Public component ──────────────────────────────────────────────────────────
export const MapWidget = ({
  width = 'lg',
  title,
  subtitle,
  ...rest
}: MapWidgetProps) => {
  const containerMaxWidth =
    typeof width === 'string'
      ? (width as 'xs' | 'sm' | 'md' | 'lg' | 'xl')
      : false
  const containerSx =
    typeof width === 'number' ? { maxWidth: width } : undefined

  return (
    <Suspense>
      <MapOptionsProvider layout="map" style="map">
        <Container
          disableGutters
          maxWidth={containerMaxWidth}
          sx={{ ...containerSx, position: 'relative' }}
        >
          <Stack spacing={{ xs: 2, md: 4 }}>
            {(title || subtitle) && (
              <Stack spacing={0.5}>
                {title && (
                  <Typography variant="h3">
                    <WidgetHtmlText>{title}</WidgetHtmlText>
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body1" color="text.secondary">
                    <WidgetHtmlText>{subtitle}</WidgetHtmlText>
                  </Typography>
                )}
              </Stack>
            )}
            <MapWidgetContent {...rest} />
          </Stack>
        </Container>
      </MapOptionsProvider>
    </Suspense>
  )
}
