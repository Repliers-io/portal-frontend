import React from 'react'

import { CardPaper } from '@shared/Containers'

type TrendContainerProps = {
  children: React.ReactNode
  dividerColor: string
}

export const TrendContainer = ({
  children,
  dividerColor
}: TrendContainerProps) => (
  <CardPaper
    sx={{
      flex: 1,
      display: 'flex',
      position: 'relative',
      boxSizing: 'border-box',
      alignItems: 'center',
      height: 96,

      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '8px',
        m: 0,
        bgcolor: dividerColor
      }
    }}
  >
    {children}
  </CardPaper>
)
