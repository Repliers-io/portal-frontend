import React from 'react'

import { Box } from '@mui/material'

interface DetailsListProps {
  spacing?: number
  mode?: 'masonry' | 'columns' | 'flex'
  children?: React.ReactNode
}

const DetailsList = ({
  spacing = 4,
  mode = 'columns',
  children
}: DetailsListProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        ...(mode === 'columns'
          ? {
              columnGap: { xs: 0, md: 4 },
              columnCount: { xs: 1, md: 2 },
              columnFill: 'balance',
              '& > *': { mb: spacing, '&:last-of-type': { mb: 0 } }
            }
          : mode === 'masonry'
            ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'masonry',
                gap: `${spacing * 8}px`
              }
            : { display: 'flex', flexWrap: 'wrap', gap: '8px' })
      }}
    >
      {children}
    </Box>
  )
}

export default DetailsList
