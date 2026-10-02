'use client'

import { useState } from 'react'

import { Box } from '@mui/material'

import { youTubeThumbnail } from 'utils/youtube'

import { LoadingSpinner } from './LoadingSpinner'
import { PlayButton } from './PlayButton'

interface VideoEmbedProps {
  videoId: string
}

export const VideoEmbed = ({ videoId }: VideoEmbedProps) => {
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const thumbnailUrl = youTubeThumbnail(videoId)
  const showSpinner = playing && !loaded
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
        borderRadius: 1,
        backgroundImage: `url(${thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {showSpinner && <LoadingSpinner />}
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`YouTube video ${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0
          }}
        />
      ) : (
        <PlayButton onClick={() => setPlaying(true)} />
      )}
    </Box>
  )
}
