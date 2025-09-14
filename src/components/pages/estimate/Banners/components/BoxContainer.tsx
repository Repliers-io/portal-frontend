import React from 'react'

import { Box, Paper } from '@mui/material'
import Grid, { type Grid2Props } from '@mui/material/Grid2'

interface BoxContainerProps {
  flexDirection?: Grid2Props['flexDirection']
  imgContent?: React.ReactNode
  textContent?: React.ReactNode
  bgColor?: string
}

const BoxContainer: React.FC<BoxContainerProps> = ({
  flexDirection = 'row',
  imgContent,
  textContent,
  bgColor = 'primary.dark'
}) => {
  return (
    <Paper>
      <Grid container flexDirection={flexDirection}>
        <Grid
          size={{ xs: 12, md: 6 }}
          position="relative"
          minHeight={{ xs: 248 }}
        >
          {imgContent}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} bgcolor={bgColor}>
          <Box
            py={3}
            sx={{
              pl: { xs: 3, md: 5 },
              pr: 3
            }}
          >
            {textContent}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default BoxContainer
