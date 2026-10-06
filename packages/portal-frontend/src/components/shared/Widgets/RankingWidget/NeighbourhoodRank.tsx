import Image from 'next/image'

import { Box, Stack, Typography } from '@mui/material'

import downTrendImg from 'assets/common/trend-down.svg'
import upTrendImg from 'assets/common/trend-up.svg'

import { formatEnglishPrice, formatPercentage } from 'utils/formatters'

type TrendingNeighbourhoodProps = {
  title: string
  value: number
  index?: number
  visible?: boolean
  avgCurrent: number
  avgPrevious: number
}

const TrendingNeighbourhood = ({
  title,
  value,
  index = 0,
  avgCurrent,
  avgPrevious,
  visible = false
}: TrendingNeighbourhoodProps) => {
  const roundedCurrent = Math.round(avgCurrent / 1000) * 1000
  const roundedPrevious = Math.round(avgPrevious / 1000) * 1000

  return (
    <Box
      sx={{
        px: 1,
        py: 1,
        borderBottom: '1px dotted #bbb',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        transitionDelay: `${index * 0.05}s`,
        '&:last-child': {
          borderBottom: 'none'
        }
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box flexGrow={1}>
          <Typography
            variant="button"
            fontSize="1rem"
            maxWidth={{ xs: '170px', md: '200px' }}
            display="block"
          >
            {title}
          </Typography>
          <Box pt={1}>
            {formatEnglishPrice(roundedPrevious)} -{' '}
            <Box display="inline" color="primary.main">
              {formatEnglishPrice(roundedCurrent)}
            </Box>
          </Box>
        </Box>
        {value !== 0 && (
          <Image
            src={value >= 0 ? upTrendImg : downTrendImg}
            alt=""
            width={26}
            height={14}
          />
        )}
        <Box
          sx={{
            px: 1,
            height: '20px',
            lineHeight: '21px', // Arrrrrr, shouldnt be hardcoded like this
            borderRadius: '10px',
            fontSize: '0.75rem',
            bgcolor: 'primary.main',
            color: 'common.white'
          }}
        >
          {formatPercentage(value)}
        </Box>
      </Stack>
    </Box>
  )
}

export default TrendingNeighbourhood
