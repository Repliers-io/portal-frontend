import React from 'react'

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
// import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import { Stack, Tooltip, Typography } from '@mui/material'

import { dateFormatMonthYear } from '@configs/i18n'

import { type Property } from 'services/API'
import { formatDate, formatEnglishPrice } from 'utils/formatters'

import { PriceDifference } from '.'

const OriginalPropertyPrice = ({ property }: { property: Property }) => {
  const { listPrice, estimate } = property
  if (!estimate) return null

  const { value, date, confidence } = estimate
  const roundedValue = Math.round(value)

  const formattedDate = formatDate(date, { template: dateFormatMonthYear })

  return (
    <Stack spacing={1}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        sx={{ height: 28 }}
      >
        <Typography
          noWrap
          variant="h3"
          title={`CONFIDENCE: ${confidence.toFixed(4)}`}
        >
          {formatEnglishPrice(roundedValue)}
        </Typography>

        <PriceDifference before={listPrice} after={value} label="none" />

        <Tooltip
          arrow
          placement="top"
          title="This estimate is for informational purposes only, based on our predictive AI. Please check with a licensed REALTOR® for the most accurate estimation."
        >
          <InfoOutlinedIcon
            sx={{
              ml: 1,
              fontSize: 18,
              cursor: 'pointer',
              color: 'text.hint'
            }}
          />
        </Tooltip>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography color="text.hint" noWrap>
          Estimated value as of {formattedDate}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default OriginalPropertyPrice
