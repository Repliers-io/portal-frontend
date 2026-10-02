import { useTranslations } from 'next-intl'

import { Box, Stack, ToggleButton } from '@mui/material'

import { SelectLabel } from 'components/atoms'

import { type Filters } from 'services/Search'

type OpenHouseValue = 'today' | 'thisWeekend' | 'any'

export const OpenHouseFilter = ({
  value,
  onChange
}: {
  value: OpenHouseValue | undefined
  onChange: (filters: Partial<Filters>) => void
}) => {
  const t = useTranslations('MapFilters')

  const items: [string, OpenHouseValue][] = [
    [t('openHouseOptions.any'), 'any'],
    [t('openHouseOptions.today'), 'today'],
    [t('openHouseOptions.thisWeekend'), 'thisWeekend']
  ]

  const handleChange = (v: OpenHouseValue) => {
    onChange({ openHouse: value === v ? undefined : v })
  }

  return (
    <Box>
      <SelectLabel>{t('openHouse')}</SelectLabel>
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        spacing={1.5}
      >
        {items.map(([label, v]) => (
          <ToggleButton
            key={v}
            value={v}
            selected={value === v}
            onChange={() => handleChange(v)}
          >
            {label}
          </ToggleButton>
        ))}
      </Stack>
    </Box>
  )
}
