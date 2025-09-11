import { useTranslations } from 'next-intl'

import { Button, Stack } from '@mui/material'

import { type PropertyClass } from '@configs/filters'
import { type ChartAction, getActionLabel } from '@shared/Stats'

const actionTitles: ChartAction[] = [
  'salePrice',
  'sold',
  'volume',
  'daysOnMarket'
]

export const ChartActionButtons = ({
  action,
  setAction,
  propertyClass
}: {
  action: ChartAction
  setAction: (action: ChartAction) => void
  propertyClass: PropertyClass
}) => {
  const t = useTranslations()

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      justifyContent="center"
      sx={{
        flex: 1,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        minWidth: { xs: '100%', sm: 'auto' }
      }}
    >
      {actionTitles.map((item) => (
        <Button
          key={item}
          size="small"
          color="primary"
          variant={item === action ? 'contained' : 'outlined'}
          onClick={() => setAction(item)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {getActionLabel(item, propertyClass, t)}
        </Button>
      ))}
    </Stack>
  )
}
