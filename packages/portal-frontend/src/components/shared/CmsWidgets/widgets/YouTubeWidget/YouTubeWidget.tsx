import { Box, Container, Stack, Typography } from '@mui/material'

import { WidgetWrapper } from '@shared/CmsWidgets/WidgetWrapper'

import { WidgetHtmlText } from '../../components'

import { fetchYouTubeVideoIds } from './utils'
import { VideoEmbed } from './VideoEmbed'

export interface YouTubeWidgetProps {
  title?: string
  subtitle?: string
  maxResults?: number
  feed?: number
  bgcolor?: string
}

const getDesktopColumns = (count: number): number => {
  if (count <= 3) return count
  if (count % 2 === 0 && count / 2 <= 3) return count / 2
  return 3
}

export const YouTubeWidget = async ({
  title,
  subtitle,
  maxResults = 2,
  bgcolor = 'background.default'
}: YouTubeWidgetProps) => {
  const videoIds = await fetchYouTubeVideoIds(maxResults)

  if (!videoIds.length) {
    return null
  }

  const desktopCols = getDesktopColumns(videoIds.length)
  const tabletCols = Math.min(desktopCols, 2)

  return (
    <WidgetWrapper maxWidth={false} bgcolor={bgcolor}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: `repeat(${tabletCols}, 1fr)`,
                md: `repeat(${desktopCols}, 1fr)`
              },
              gap: { xs: 2, md: 4 }
            }}
          >
            {videoIds.map((videoId) => (
              <VideoEmbed key={videoId} videoId={videoId} />
            ))}
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
