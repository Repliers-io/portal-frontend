import React, { useEffect, useState } from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import ArrowPie from 'assets/common/pie-arrow.svg'

const sweepDelay = 200
const sweepDuration = 600
const opacityDuration = sweepDuration * 0.25

const ArrowNeedle = ({
  rotation,
  animate = true
}: {
  rotation: number
  animate?: boolean
}) => {
  const [sweep, setSweep] = useState(false)
  const [sweepBack, setSweepBack] = useState(false)

  // NOTE: sweep back duration is a FRACTION of the original one,
  // to make the animation forward/backward consistent
  const sweepBackDuration = Math.floor(sweepDuration * ((180 - rotation) / 180))

  useEffect(() => {
    const timer = setTimeout(() => setSweep(true), sweepDelay)
    return () => clearTimeout(timer)
  }, [])

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only trigger on the transform transition, and only after the first sweep
    if (e.propertyName === 'transform' && sweep && !sweepBack)
      setSweepBack(true)
  }

  return (
    <Box
      sx={{
        left: 0,
        top: '50%',
        width: '100%',
        height: '100%',
        position: 'absolute',
        ...(animate
          ? {
              opacity: sweep ? 1 : 0,
              transform: sweep
                ? sweepBack
                  ? `rotate(${-(180 - rotation)}deg)`
                  : 'rotate(0deg)'
                : 'rotate(-180deg)',
              transition: sweepBack
                ? `transform ${sweepBackDuration}ms ease-out`
                : `opacity ${opacityDuration}ms linear, transform ${sweepDuration}ms ease-in`
            }
          : {
              transform: `rotate(${-(180 - rotation)}deg)`
            })
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <Box
        sx={{
          // center point inside overlay area, arrow centering relative to this point
          top: '50%',
          left: '50%',
          width: '1px',
          height: '1px',
          position: 'absolute',
          transform: 'translate(-50%, -50%)',

          '& img': {
            // half of arrow circle width/height = 32px, so -16px => center point
            top: '-16px',
            left: '-16px',
            position: 'absolute'
          }
        }}
      >
        <Image src={ArrowPie} width={111} height={32} alt="Pie arrow" />
      </Box>
    </Box>
  )
}

export default ArrowNeedle
