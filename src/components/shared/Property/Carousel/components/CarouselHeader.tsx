import { Stack, Typography } from '@mui/material'

import { CarouselNavigation } from '.'

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
    <Stack
      spacing={2}
      width="100%"
      direction="row"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      sx={{ minHeight: 48 }}
    >
      <Typography variant="h2" sx={{ flex: 1 }}>
        {title}
      </Typography>
      {navigation && <CarouselNavigation onPrev={onPrev} onNext={onNext} />}
    </Stack>
  )
}

export default CarouselHeader
