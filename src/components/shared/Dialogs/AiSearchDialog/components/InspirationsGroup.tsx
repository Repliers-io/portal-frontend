import Image from 'next/legacy/image'

import { Box, Button } from '@mui/material'

import { capitalize } from 'utils/strings'

import { cardHeight, cardWidth } from '../constants'

const InspirationsGroup = ({
  name,
  cover,
  onClick
}: {
  name: string
  cover: string
  onClick: (group: string) => void
}) => {
  return (
    <Button
      fullWidth
      variant="contained"
      onClick={() => onClick(name)}
      sx={{
        p: 0,
        overflow: 'hidden',
        bgcolor: 'common.black',
        width: { xs: 'calc(50vw - 24px)', sm: cardWidth },
        height: { xs: 'auto', sm: cardHeight },
        aspectRatio: { xs: '1', sm: '' },
        transition: 'background-color 0.2s linear',
        '&:hover': {
          bgcolor: 'common.black',
          '& .group-cover': {
            filter: 'none !important',
            opacity: '1 !important'
          }
        }
      }}
    >
      {cover && (
        <Image
          alt={name}
          src={cover}
          unoptimized
          layout="fill"
          objectFit="cover"
          className="group-cover"
          style={{
            opacity: 0.8,
            willChange: 'opacity',
            filter: 'grayscale(40%)',
            transition: 'opacity 0.2s linear, filter 0.2s linear'
          }}
        />
      )}
      <Box sx={{ position: 'relative', textShadow: '0 0 10px #000C' }}>
        {capitalize(name)}
      </Box>
    </Button>
  )
}

export default InspirationsGroup
