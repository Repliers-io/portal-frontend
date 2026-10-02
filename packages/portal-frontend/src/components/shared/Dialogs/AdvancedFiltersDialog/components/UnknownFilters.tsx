'use client'

import { IconButton, Stack, Typography } from '@mui/material'

import filtersConfig from '@configs/filters'
import { CloseIcon } from '@configs/icons'
import { GridHeaderContainer } from '@pages/search/components/MapRoot/components/GridContent/components/GridHeaderContainer'

import { SelectLabel } from 'components/atoms'

import { type Filters } from 'services/Search'
import { getUnknownFilters } from 'utils/filters'
import { sentenceCase, splitCamelCase } from 'utils/strings'

const { defaultFilters, defaultAdvancedFilters } = filtersConfig
const defaults: Filters = { ...defaultAdvancedFilters, ...defaultFilters }

// camelCase key -> readable label, e.g. minYearBuilt -> "Min year built"
const humanize = (key: string) => sentenceCase(splitCamelCase(key))

const formatValue = (value: unknown) =>
  Array.isArray(value) ? value.join(', ') : String(value)

// Vertical list of active filters that have no UI control in the current
// tenant. Shown above the first advanced slot so they remain visible and
// removable. Renders nothing when every active filter is known to the UI.
export const UnknownFilters = ({
  dialogState,
  onChange
}: {
  dialogState: Filters
  onChange: (mutation: Partial<Filters>) => void
}) => {
  const unknown = getUnknownFilters(dialogState)
  if (!unknown.length) return null

  const remove = (key: keyof Filters) =>
    onChange({ [key]: defaults[key] } as Partial<Filters>)

  return (
    <GridHeaderContainer>
      <Stack direction="column" spacing={1}>
        {unknown.map(({ key, value }) => (
          <Stack
            key={key}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="body2">
              <SelectLabel component="span" variant="inherit" sx={{ pb: 0 }}>
                {humanize(key)}:
              </SelectLabel>{' '}
              {formatValue(value)}
            </Typography>
            <IconButton
              size="small"
              aria-label={`Remove ${key} filter`}
              onClick={() => remove(key)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </GridHeaderContainer>
  )
}
