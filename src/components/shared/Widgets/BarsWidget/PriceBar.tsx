import { Box, Typography } from '@mui/material'

import { formatEnglishPrice } from 'utils/formatters'

type PriceBarProps = {
  width: string
  value: number
  color: string
  index: number
  visible: boolean
}

const PriceBar = ({ width, value, color, index, visible }: PriceBarProps) => {
  const roundedValue = Math.round(value / 1000) * 1000
  return (
    <Box
      sx={{
        my: 2.5,
        color,
        bgcolor: color,
        height: '3px',
        position: 'relative',
        width: visible ? width : '0%',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease, width 0.2s ease',
        transitionDelay: `${index * 0.1}s`
      }}
    >
      <Typography
        sx={{
          px: 1,
          top: '50%', // 4 / 2
          left: '100%',
          fontWeight: 700,
          position: 'absolute',
          transform: 'translateY(-50%)'
        }}
      >
        {formatEnglishPrice(roundedValue)}
      </Typography>
    </Box>
  )
}

export default PriceBar
