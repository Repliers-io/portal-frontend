import React from 'react'
import Link from 'next/link'

import { Box, CardMedia, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

type NavigationPost = {
  slug: string
  title: string
  featuredImage?: {
    url: string
    alt?: string
  }
}

type NavigationCardProps = {
  post: NavigationPost
  direction: 'previous' | 'next'
}

export const NavigationCard = ({ post, direction }: NavigationCardProps) => {
  const previous = direction === 'previous'
  const { slug, title, featuredImage } = post

  return (
    <Link
      href={`${routes.blog}/${slug}`}
      style={{
        flex: 1,
        textDecoration: 'none'
      }}
    >
      <Stack
        spacing={2}
        direction={previous ? 'row-reverse' : 'row'}
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: 'background.default'
          // transition: 'background-color 0.3s'
          // '&:hover': {
          //   bgcolor: 'background.paper'
          // }
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 80,
            flexShrink: 0,
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'grey.200',
            borderRadius: 1
          }}
        >
          <Box
            sx={{
              mt: 3,
              zIndex: 1,
              fontSize: '3rem',
              color: 'grey.500',
              fontFamily: 'serif',
              position: 'absolute'
            }}
          >
            &rdquo;
          </Box>

          {featuredImage && (
            <CardMedia
              component="img"
              image={featuredImage.url}
              alt={featuredImage.alt || title}
              sx={{
                width: '100%',
                height: '100%',
                zIndex: 2,
                objectFit: 'cover',
                position: 'absolute',
                inset: 0,

                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  zIndex: 3,
                  inset: 0,
                  border: 1,
                  borderRadius: 1,
                  borderColor: 'rgba(0,0,0, 0.1)'
                }
              }}
            />
          )}
        </Box>
        <Stack
          spacing={1}
          alignItems={previous ? 'flex-end' : 'flex-start'}
          sx={{ pt: 0.5, flex: 1, minWidth: 0 }}
        >
          <Typography variant="caption" color="text.secondary">
            {previous ? 'Previous →' : '← Next'}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: previous ? 'right' : 'left',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2
            }}
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </Stack>
      </Stack>
    </Link>
  )
}
