import { useTranslations } from 'next-intl'

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined'
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined'
import { Stack, Typography } from '@mui/material'

import { formatPrice, toSafeNumber } from 'utils/formatters'
import { createPropertyI18nUtils } from 'utils/properties'

const trendingLimit = 9.9 // % to double the arrow

const PriceDifference = ({
  before,
  after,
  percentage = false,
  label = 'ask', // default value for SOLD listings
  date = ''
}: {
  before: number | string
  after: number | string
  date?: string
  percentage?: boolean
  label?: 'date' | 'ask' | 'none'
}) => {
  const t = useTranslations()
  const { getUpdatedDays } = createPropertyI18nUtils(t)

  const beforeNumber = toSafeNumber(before)
  const afterNumber = toSafeNumber(after)

  const value = Math.round(afterNumber - beforeNumber)
  const roundedPercentage = Math.round((value / beforeNumber) * 100 * 10) / 10

  // ignore price changes less than 0.1%
  if (!roundedPercentage) return null

  let color
  let textLabel
  let Icon

  if (afterNumber > beforeNumber) {
    color = 'success.dark'
    textLabel = 'Above asking'
    Icon =
      roundedPercentage > trendingLimit
        ? KeyboardDoubleArrowUpOutlinedIcon
        : KeyboardArrowUpOutlinedIcon
  } else {
    color = 'error.dark'
    textLabel = 'Below asking'
    Icon =
      roundedPercentage < -trendingLimit
        ? KeyboardDoubleArrowDownOutlinedIcon
        : KeyboardArrowDownOutlinedIcon
  }

  // we pass `updated` argument for listings on sale (NOT SOLD YET)
  if (date && label === 'date') {
    const updatedDays = getUpdatedDays(date)
    textLabel = updatedDays.label
  }

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <Typography
        fontWeight={500}
        color={color}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Icon sx={{ color }} fontSize="small" />
        {formatPrice(Math.abs(value))}
      </Typography>

      {percentage && (
        <Typography color="text.hint">
          ({roundedPercentage > 0 ? '+' : ''}
          {roundedPercentage}%)
        </Typography>
      )}

      {label !== 'none' && (
        <Typography color="text.hint">{textLabel}</Typography>
      )}
    </Stack>
  )
}

export default PriceDifference
