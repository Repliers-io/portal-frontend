'use client'

import { useRouter } from 'next/navigation'

import { Stack } from '@mui/material'

import FilterChip from './FilterChip'

const FiltersList = ({ urlFilters }: { urlFilters: string[] }) => {
  const router = useRouter()

  // leave only custom filters (counts/amounts) not present in catalog header
  const customFilters = urlFilters.filter(
    (filter) =>
      filter.includes('-') &&
      !filter.startsWith('for-') &&
      !filter.startsWith('sort-')
  )

  const deleteFilter = (filter: string) => {
    const url = window.location.pathname.toLowerCase()
    router.push(
      url
        .replace(filter, '')
        .replace(/_+/g, '_')
        .replace(/\/_/g, '/')
        .replace(/_$/, '')
    )
  }

  return (
    <Stack
      width="100%"
      spacing={2}
      direction="row"
      alignItems="center"
      justifyContent="center"
    >
      {customFilters.map((filter) => (
        <FilterChip
          key={filter}
          label={filter}
          onDelete={() => deleteFilter(filter)}
        />
      ))}
    </Stack>
  )
}

export default FiltersList
