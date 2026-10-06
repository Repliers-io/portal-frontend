'use client'

import React from 'react'

import { Box, Grid, Stack, Typography } from '@mui/material'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

interface SectionWithVideosProps {
  heading?: string
  content?: string
  videoIds: string[]
}

export const SectionWithVideos = ({
  heading,
  content,
  videoIds
}: SectionWithVideosProps) => {
  const columns = 1 //videoIds.length > 1 ? 2 : 1

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        {heading && <Typography variant="h3">{heading}</Typography>}

        {content && <CmsContentRenderer content={content} />}
      </Stack>
      <Grid container spacing={4} columns={columns}>
        {videoIds.map((videoId) => (
          <Grid key={videoId} size={{ xs: 2, md: 1 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden'
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`YouTube video ${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                  borderRadius: 4
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
