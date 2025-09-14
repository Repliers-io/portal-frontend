import { Box, Typography } from '@mui/material'

import CarouselNavigation from './CarouselNavigation'

const CarouselHeader = ({
  title,
  navigation,
  onPrev,
  onNext
}: {
  title: string
  navigation: boolean
  onPrev: () => void
  onNext: () => void
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 60,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}
    >
      <Typography
        variant="h2"
        lineHeight={1.2}
        sx={{
          flex: 1,
          pr: navigation ? '160px' : 0,
          pl: { md: navigation ? '160px' : '0' },
          textAlign: { xs: 'left', md: 'center' }
        }}
      >
        {title}
      </Typography>
      {navigation && (
        <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
          <CarouselNavigation onPrev={onPrev} onNext={onNext} />
        </Box>
      )}
    </Box>
  )
}

export default CarouselHeader
