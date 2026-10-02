import React from 'react'

import { Button, Stack } from '@mui/material'

import { NextIcon, PrevIcon } from '@configs/icons'

const CarouselNavButton = ({
  size,
  direction,
  onClick
}: {
  size: 'small' | 'medium'
  direction: 'prev' | 'next'
  onClick: () => void
}) => {
  return (
    <Button
      aria-label={direction === 'prev' ? 'Previous' : 'Next'}
      size={size}
      variant={size === 'small' ? 'outlined' : 'contained'}
      sx={{ minWidth: size === 'small' ? 48 : 60, p: 0 }}
      onClick={onClick}
    >
      {direction === 'prev' ? (
        <PrevIcon fontSize={size} />
      ) : (
        <NextIcon fontSize={size} />
      )}
    </Button>
  )
}

export const CarouselNavigation = ({
  size,
  onPrev,
  onNext
}: {
  size: 'small' | 'medium' | 'large'
  onPrev: () => void
  onNext: () => void
}) => {
  const buttonSize = size === 'small' ? 'small' : 'medium'

  return (
    <Stack
      direction="row"
      spacing={size === 'small' ? 1 : 2}
      sx={{ pr: size === 'small' ? '1px' : 0 }}
    >
      <CarouselNavButton size={buttonSize} direction="prev" onClick={onPrev} />
      <CarouselNavButton size={buttonSize} direction="next" onClick={onNext} />
    </Stack>
  )
}
