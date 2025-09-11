import { useTranslations } from 'next-intl'

import { MenuItem, TextField } from '@mui/material'

import { type ChartTimeRange } from '@shared/Stats'

export const ChartRangeSelect = ({
  value,
  onChange
}: {
  value: number
  onChange: (value: ChartTimeRange) => void
}) => {
  const t = useTranslations('Charts')

  return (
    <TextField
      select
      size="small"
      value={value}
      label={t('timeRange')}
      sx={{ width: 144 }}
      onChange={(e) => onChange(Number(e.target.value) as ChartTimeRange)}
    >
      <MenuItem value={6}>{t('timeRanges.6')}</MenuItem>
      <MenuItem value={12}>{t('timeRanges.12')}</MenuItem>
      <MenuItem value={24}>{t('timeRanges.24')}</MenuItem>
      {/* <MenuItem value={120}>{t('timeRanges.120')}</MenuItem> */}
    </TextField>
  )
}
