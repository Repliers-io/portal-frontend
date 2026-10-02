import React from 'react'

import {
  Box,
  CardContent,
  Paper,
  Rating,
  Stack,
  Typography
} from '@mui/material'

import { type Post } from 'services/CMS'

type ReviewCardProps = {
  review: Post
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const { title, /*publishedAt,*/ acf } = review
  // ACF fields contain all review data
  const reviewText = acf?.review as string | undefined
  // const reviewSource = acf?.source as string | undefined

  if (!reviewText) return null

  return (
    <Paper
      sx={{
        width: { xs: 358, sm: 389 },
        height: 290,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none !important',
        position: 'relative',
        '&:before': {
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            pb: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
            justifyContent="space-between"
          >
            {title && (
              <Typography variant="h6" color="text.primary">
                {title}
              </Typography>
            )}

            <Rating
              value={5}
              readOnly
              size="small"
              sx={{ color: 'primary.light', fontSize: '1rem' }}
            />
          </Stack>

          <Typography
            component="span"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 8,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {reviewText}
          </Typography>
        </Box>
        {/* {reviewSource && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 'auto', textTransform: 'capitalize' }}
          >
            Source: {reviewSource}
          </Typography>
        )}
        {publishedAt && (
          <Typography variant="caption" color="text.secondary">
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        )} */}
      </CardContent>
    </Paper>
  )
}
