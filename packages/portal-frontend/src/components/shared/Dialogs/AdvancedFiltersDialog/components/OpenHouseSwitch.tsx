import { useTranslations } from 'next-intl'

import { FormControlLabel } from '@mui/material'

import { AndroidSwitch } from 'components/atoms'

import { type Filters } from 'services/Search'

export const OpenHouseSwitch = ({
  value,
  onChange
}: {
  value: Filters['openHouse']
  onChange: (filters: Partial<Filters>) => void
}) => {
  const t = useTranslations('MapFilters')

  return (
    <FormControlLabel
      sx={{ pb: 2, '& .MuiTypography-root': { pl: 1, fontWeight: 500 } }}
      control={
        <AndroidSwitch
          checked={!!value}
          onChange={(e) =>
            onChange({ openHouse: e.target.checked ? 'any' : undefined })
          }
        />
      }
      label={t('openHouse')}
    />
  )
}
