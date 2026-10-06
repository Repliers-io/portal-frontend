import { Stack, Typography } from '@mui/material'

import { ScrubbedDate } from 'components/atoms'

import { formatEnglishPrice } from 'utils/formatters'

export const HistoryItemRow = ({
  date,
  label = '',
  price
}: {
  date: string
  label: string
  price?: number | string | null
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 0.5, sm: 1, md: 1 }}
      alignItems={{ sm: 'center' }}
      sx={{ flex: 1 }}
    >
      <Typography
        color="text.hint"
        minWidth="28%"
        sx={{ whiteSpace: 'nowrap' }}
      >
        <ScrubbedDate value={date} />
      </Typography>
      <Typography fontWeight={500} minWidth="35%" sx={{ whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      {Number(price) > 0 && (
        <Typography variant="h6" minWidth="25%">
          {formatEnglishPrice(price)}
        </Typography>
      )}
    </Stack>
  )
}
