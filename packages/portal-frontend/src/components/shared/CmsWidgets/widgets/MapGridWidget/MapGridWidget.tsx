'use client'

import { Suspense, useEffect, useState } from 'react'

import { Box, Container, Stack, Typography } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { MapLayoutSwitch } from '@shared/Map'

import MapOptionsProvider, { useMapOptions } from 'providers/MapOptionsProvider'

import { WidgetHtmlText } from '../../components'
import { GridWidgetContent } from '../GridWidget'
import { MapWidgetContent, type MapWidgetContentProps } from '../MapWidget'

const { listingCardSizes, gridSpacing } = gridConfig

// Default map height = 2 card rows + row gap + optional pagination controls
const calcDefaultHeight = (pagination?: boolean) => {
  const cardHeight = Number(listingCardSizes.medium.height)
  const spacing = gridSpacing * 8
  return cardHeight * 2 + spacing + (pagination ? spacing + 28 : 0)
}

export interface MapGridWidgetProps extends MapWidgetContentProps {
  /** Optional section title rendered above the widget. */
  title?: string
  /** Optional subtitle rendered below the title. */
  subtitle?: string
  /** Total width of the widget in card columns. Defaults to 4. */
  maxColumns?: number
  /**
   * Columns the grid occupies beside the map; the map takes the rest
   * (`maxColumns - gridColumns`). When omitted, auto = min(2, floor(maxColumns / 2)).
   */
  gridColumns?: number
  /** Show the map/grid layout toggle button. Defaults to true. */
  layoutSwitch?: boolean
  /** Map height on mobile (xs). Falls back to height when not set. */
  mobileHeight?: number
  // Grid props
  pageSize?: number
  pagination?: boolean
}

const MapGridWidgetContent = ({
  title,
  subtitle,
  // Total width in card columns. Default 4 keeps map + grid visible together.
  maxColumns = 4,
  gridColumns,
  layoutSwitch,
  mobileHeight,
  pageSize = 4,
  pagination = true,
  height,
  fitToListings = true,
  ...mapProps
}: MapGridWidgetProps) => {
  const [empty, setEmpty] = useState(false)
  const { layout, mapRef } = useMapOptions()
  const gridLayout = layout === 'grid'

  // When switching back to map layout, Mapbox canvas may have stale dimensions.
  // Trigger resize after the container becomes visible.
  useEffect(() => {
    if (!gridLayout) {
      requestAnimationFrame(() => mapRef.current?.resize())
    }
  }, [gridLayout])

  // Columns the grid takes beside the map; the map fills the rest.
  // Auto-split (when gridColumns is omitted): up to 2 grid columns, the map
  // gets the remainder. Always clamped so the map keeps at least 1 column.
  const autoGridColumns = Math.min(2, Math.max(1, Math.floor(maxColumns / 2)))
  const gridCols = Math.min(
    Math.max(1, gridColumns ?? autoGridColumns),
    Math.max(1, maxColumns - 1)
  )

  const cardWidth = Number(listingCardSizes.medium.width)
  const spacing = gridSpacing * 8
  // Helper: pixel width that fits exactly N cards + gaps between them
  const colWidth = (n: number) => cardWidth * n + spacing * (n - 1)

  const gridHeight = height || calcDefaultHeight(pagination)

  // Total width: maxColumns cards on lg, capped at 3 cards on md (tablet).
  const containerMaxWidth = {
    md: `${colWidth(Math.min(maxColumns, 3))}px !important`,
    lg: `${colWidth(maxColumns)}px !important`
  }

  // In grid-only layout fetch enough cards to fill the full-width grid.
  const calculatedPageSize = gridLayout
    ? pageSize * Math.ceil(maxColumns / gridCols)
    : pageSize

  const { listings } = mapProps

  return (
    <Box
      data-empty={empty || undefined}
      sx={{
        width: '100vw',
        boxSizing: 'border-box',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        '&[data-empty]': { display: 'none' }
      }}
    >
      <Container
        disableGutters
        sx={{
          boxSizing: 'border-box',
          maxWidth: containerMaxWidth,
          px: { xs: 2, sm: 3, md: 0 }
        }}
      >
        <Stack spacing={{ xs: 2, md: 4 }}>
          {(title || subtitle) && (
            <Stack
              direction="row"
              alignItems="flex-end"
              justifyContent="space-between"
            >
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

              {layoutSwitch && (
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <MapLayoutSwitch variant="widget" />
                </Box>
              )}
            </Stack>
          )}

          <Stack
            spacing={gridLayout ? 0 : 4}
            direction={{ xs: 'column', md: 'row' }}
          >
            {/* Map — always in DOM to preserve Mapbox instance; hidden in grid layout */}
            <Box
              sx={{
                overflow: 'hidden',
                width: { xs: '100%', lg: 'auto' },
                flex: gridLayout ? '0 0 0' : 1,
                visibility: gridLayout ? 'hidden' : 'visible',
                // When grid layout: collapse completely out of flex flow
                '& > div': {
                  ...(mobileHeight && {
                    height: { xs: mobileHeight, md: gridHeight }
                  })
                }
              }}
            >
              <MapWidgetContent
                height={gridHeight}
                fitToListings={fitToListings}
                {...mapProps}
              />
            </Box>

            {/* Grid — expands to full width when map is hidden */}
            <Box
              sx={{
                flexShrink: 0,
                // +0.5px: prevents spurious scrollbar from subpixel rendering
                height: { md: gridHeight + 0.5 },
                width: {
                  xs: '100%',
                  md: gridLayout ? '100%' : colWidth(1),
                  lg: gridLayout ? '100%' : colWidth(gridCols)
                },
                overflowY: { md: 'auto' }
              }}
            >
              <GridWidgetContent
                key={layout}
                listings={listings}
                pageSize={calculatedPageSize}
                pagination={pagination}
                onResultsChange={(count) => setEmpty(count === 0)}
              />
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export const MapGridWidget = (props: MapGridWidgetProps) => (
  <Suspense>
    <MapOptionsProvider layout="map" style="map">
      <MapGridWidgetContent {...props} />
    </MapOptionsProvider>
  </Suspense>
)
