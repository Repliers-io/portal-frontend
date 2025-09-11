import React, { useEffect, useState } from 'react'

import { Box } from '@mui/material'

interface SlideProps {
  active: boolean
  image: string
  startTransform?: string
  endTransform?: string
  duration: number
  opacityDuration: number
}

const Slide: React.FC<SlideProps> = ({
  active,
  image,
  startTransform,
  endTransform,
  duration,
  opacityDuration
}) => {
  const [animating, setAnimating] = useState(false)
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    if (active) {
      setAnimating(true)
      setShowing(true)

      // start fading image back to black when reaching the end of the animation
      setTimeout(() => setShowing(false), duration - opacityDuration)
      setTimeout(() => setAnimating(false), duration + opacityDuration)
    }
  }, [active])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: `opacity ${opacityDuration}ms linear, transform ${duration}ms linear`,
        transform: animating ? endTransform : startTransform,
        opacity: showing ? 1 : 0
      }}
    />
  )
}

export default Slide
