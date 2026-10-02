import { Fragment } from 'react'

import { Stack } from '@mui/material'

import { type Filters } from 'services/Search'

import { useAdvancedFilters } from './useAdvancedFilters'

export const AdvancedFiltersTab = ({
  dialogState,
  priceBuckets,
  onChange,
  onSubmit
}: {
  dialogState: Filters
  priceBuckets: Record<string, number>
  onChange: (mutation: Partial<Filters>) => void
  onSubmit: () => void
}) => {
  const slots = useAdvancedFilters({
    dialogState,
    priceBuckets,
    onChange,
    onSubmit
  })

  return (
    <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 4 }} pb={2}>
      {slots.map((slot, index) => (
        <Fragment key={index}>{slot}</Fragment>
      ))}
    </Stack>
  )
}
