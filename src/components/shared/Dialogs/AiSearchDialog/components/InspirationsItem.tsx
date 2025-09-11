import Image from 'next/legacy/image'

import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import { Box, Button } from '@mui/material'

import { cardHeight, cardWidth } from '../constants'

const InspirationsItem = ({
  url,
  onClick
}: {
  url: string
  onClick: (url: string) => void
}) => {
  return (
    <Button
      variant="contained"
      sx={{
        p: 0,
        overflow: 'hidden',
        bgcolor: 'common.black',
        width: { xs: 'calc(50vw - 24px)', sm: cardWidth },
        height: { xs: 'auto', sm: cardHeight },
        aspectRatio: { xs: '1', sm: '' },
        transition: 'background-color 0.2s linear',
        '&:hover': {
          xs: {},
          sm: {
            bgcolor: 'primary.main',

            '& .item-cover': {
              opacity: '0.8 !important',
              filter: 'grayscale(40%) !important'
            },

            '& .item-title': {
              opacity: '1 !important'
            }
          }
        }
      }}
      onClick={() => onClick(url)}
    >
      <Image
        alt=""
        src={url}
        unoptimized
        layout="fill"
        objectFit="cover"
        className="item-cover"
        style={{
          opacity: 1,
          transition: 'opacity 0.2s linear, filter 0.2s linear'
        }}
      />
      <Box
        className="item-title"
        sx={{
          opacity: 0,
          position: 'relative',
          textShadow: '0 0 10px #0006',
          transition: 'opacity 0.2s linear'
        }}
      >
        <ImageSearchIcon sx={{ mt: 1 }} />
      </Box>
    </Button>
  )
}

export default InspirationsItem
