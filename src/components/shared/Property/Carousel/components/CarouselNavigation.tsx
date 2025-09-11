import type React from 'react'

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
    <Button variant="contained" onClick={onClick}>
      {direction === 'prev' ? <IcoPrev /> : <IcoNext />}
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
    <Stack spacing={2} direction="row">
      <CarouselNavButton direction="prev" onClick={onPrev} />
      <CarouselNavButton direction="next" onClick={onNext} />
    </Stack>
  )
}

export default CarouselNavigation
