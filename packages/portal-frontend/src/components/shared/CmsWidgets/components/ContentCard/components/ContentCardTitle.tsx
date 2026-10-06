import React from 'react'

import { Typography } from '@mui/material'

interface ContentCardTitleProps {
  title: string
  linkUrl: string
}

export const ContentCardTitle = ({ title, linkUrl }: ContentCardTitleProps) => {
  return (
    <Typography
      variant="h3"
      component="a"
      href={linkUrl}
      sx={{
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' }
      }}
    >
      {title}
    </Typography>
  )
}
