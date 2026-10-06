'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import { type Filters } from 'services/Search'
import {
  type RankOptions,
  rawFieldLabel,
  rawFieldsFor,
  rawSelection,
  rawValues
} from 'utils/filters'

import { RawFieldAccordion } from './RawFieldAccordion'
import { searchBarHeight, SearchField } from './SearchField'
import { useRawFilterOptions } from './useRawFilterOptions'

const minQueryLength = 3

/** "Features": the raw fields of the draft's transaction type, one row each. */
export const RawFilters = ({
  dialogState,
  sort,
  minCount,
  onChange
}: RankOptions & {
  dialogState: Filters
  onChange: (mutation: Partial<Filters>) => void
}) => {
  const t = useTranslations('Dialogs.AdvancedFilters')
  const [query, setQuery] = useState('')
  const options = useRawFilterOptions({ sort, minCount })

  const fields = rawFieldsFor(dialogState)
  if (!fields.length) return null

  // From the third typed character on, a field stays when its title or one of its
  // values contains the text.
  const needle = query.trim()
  const match = needle.length >= minQueryLength ? needle : undefined
  const contains = (text: string) =>
    !match || text.toLowerCase().includes(match.toLowerCase())
  const rows = fields
    .map((field) => ({
      field,
      label: rawFieldLabel(field),
      matches: match ? (options?.[field] ?? []).filter(contains) : []
    }))
    .filter(({ label, matches }) => contains(label) || matches.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <Box>
      {/* docked at the top of the dialog's scroll area while the fields scroll under it;
          the white ground and the gap below keep it apart from the passing rows */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          // above the docked titles (2) and the checkbox inputs (1) passing under it
          zIndex: 3,
          // the field rests 16px above the bar's bottom, the tenant's bar height sets
          // the gap above it
          height: searchBarHeight,
          boxSizing: 'border-box',
          pb: 2,
          display: 'flex',
          alignItems: 'flex-end',
          bgcolor: 'common.white'
        }}
      >
        <SearchField
          value={query}
          placeholder={t('rawSearch')}
          onChange={setQuery}
        />
      </Box>
      {rows.map(({ field, label, matches }) => (
        <RawFieldAccordion
          key={field}
          label={label}
          match={match}
          matches={matches}
          options={options && (options[field] ?? [])}
          selected={rawValues(dialogState, field)}
          onChange={(values) => onChange(rawSelection(field, values))}
        />
      ))}
    </Box>
  )
}
