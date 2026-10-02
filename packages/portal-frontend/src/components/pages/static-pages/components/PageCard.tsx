import React from 'react'

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Typography
} from '@mui/material'

import { FolderIcon } from '@configs/icons'

import { getPagePath, type Page } from 'services/CMS'

type PageCardProps = {
  page: Page
}

export const PageCard = ({ page }: PageCardProps) => {
  const href = getPagePath(page, page.folder)

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 0,
        position: 'relative',
        overflow: 'hidden',

        '&:before': {
          border: 1,
          borderColor: 'divider',
          borderRadius: 'inherit',
          content: '""',
          inset: 0,
          position: 'absolute',
          pointerEvents: 'none'
        }
      }}
    >
      <CardActionArea
        href={href}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
      >
        {page.featuredImage && (
          <CardMedia
            component="img"
            height="200"
            image={page.featuredImage.url}
            alt={page.featuredImage.alt || page.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5">
              {page.folder && (
                <Box
                  component="span"
                  sx={{ position: 'relative', top: 3, mr: 1.5 }}
                >
                  <FolderIcon fontSize="inherit" />
                </Box>
              )}
              {page.title ||
                page.slug
                  .replace(/[-_]/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Typography>
            {page.excerpt && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {page.excerpt}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
