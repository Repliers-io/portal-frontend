import { Button, Stack } from '@mui/material'

import IcoNext from '@icons/IcoNext'
import IcoPrev from '@icons/IcoPrev'

const CarouselNavButton = ({
  direction,
  onClick
}: {
  direction: 'prev' | 'next'
  onClick: () => void
}) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      sx={{
        width: 60,
        height: 60,
        minWidth: 0,
        borderRadius: '50%'
      }}
    >
      {direction === 'prev' ? (
        <IcoPrev fontSize="small" sx={{ pr: 0.5 }} />
      ) : (
        <IcoNext fontSize="small" sx={{ pl: 0.5 }} />
      )}
    </Button>
  )
}

const CarouselNavigation = ({
  onPrev,
  onNext
}: {
  onPrev: () => void
  onNext: () => void
}) => {
  return (
    <Stack spacing={2.5} direction="row">
      <CarouselNavButton direction="prev" onClick={onPrev} />
      <CarouselNavButton direction="next" onClick={onNext} />
    </Stack>
  )
}

export default CarouselNavigation
