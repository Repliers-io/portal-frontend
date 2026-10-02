import React from 'react'

import { Box, Container, Typography } from '@mui/material'

import { type ContentAuthor, type Post } from 'services/CMS'

type AuthorDebugInfoProps = {
  author: ContentAuthor
  posts: Post[]
  reviews?: Post[]
}

export const AuthorDebugInfo = ({
  author,
  posts,
  reviews
}: AuthorDebugInfoProps) => {
  const debugInfo = {
    author,
    posts,
    reviews
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Author Data (Debug):
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 3,
            bgcolor: 'grey.100',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}
        >
          {JSON.stringify(debugInfo, null, 2)}
        </Box>
      </Box>
    </Container>
  )
}
