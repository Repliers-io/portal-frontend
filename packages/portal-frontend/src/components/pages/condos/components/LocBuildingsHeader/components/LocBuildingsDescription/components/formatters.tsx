import React from 'react'

import { Typography } from '@mui/material'

export const Bold = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="body2"
    component="span"
    fontWeight={600}
    color="text.default"
  >
    {children}
  </Typography>
)

export const LocationsList = ({ items }: { items: React.ReactNode[] }) => (
  <>
    {items.map((item, index) => {
      const hasComma = index < items.length - 1
      return (
        <React.Fragment key={index}>
          <span style={{ whiteSpace: 'nowrap' }}>
            {item}
            {hasComma && ','}
          </span>
          {hasComma && ' '}
        </React.Fragment>
      )
    })}
  </>
)
