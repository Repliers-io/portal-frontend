import { Stack, Typography } from '@mui/material'

import { ScrubbedDate } from 'components/atoms'

import { formatEnglishPrice } from 'utils/formatters'

const HistoryItemRow = ({
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
    >
      <Typography color="text.hint" minWidth="100px" width="28%">
        <ScrubbedDate value={date} />
      </Typography>
      <Typography fontWeight={500} minWidth="128px" width="35%">
        {label}
      </Typography>
      <Typography variant="h6" minWidth="90px" width="25%">
        {Number(price) > 0 ? formatEnglishPrice(price) : ''}
      </Typography>
    </Stack>
  )
}

export default HistoryItemRow
