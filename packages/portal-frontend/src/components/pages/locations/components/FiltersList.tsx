'use client'

import { Stack } from '@mui/material'

import { FilterChip } from './FilterChip'

const typeSearchMap: Record<string, string> = {
  lofts: 'loft',
  penthouses: 'penthouse'
}

// Tokens that individually contribute nothing to search results and should be
// stripped when they are all that's left after removing a meaningful filter.
// - 'for' / 'sale': components of 'for-sale' which is the default status (no-op)
// - 'construction': orphan from 'new-construction', unmapped in parseListingType
const trivialFilterTokens = new Set(['for', 'sale', 'construction'])

const allTrivialTokens = (segment: string) => {
  const tokens = segment.split('-').filter(Boolean)
  return tokens.length > 0 && tokens.every((t) => trivialFilterTokens.has(t))
}

export const FiltersList = ({
  urlFilters,
  search
}: {
  urlFilters: string[]
  search?: string
}) => {
  // leave only custom filters (counts/amounts) not present in catalog header
  const customFilters = urlFilters.filter(
    (filter) =>
      filter.includes('-') &&
      !filter.startsWith('for-') &&
      !filter.startsWith('sort-')
  )

  const typeFilters = urlFilters.filter((f) => f in typeSearchMap)

  const newFilter = urlFilters.includes('new')

  const deleteFilter = (filter: string) => {
    const url = window.location.pathname.toLowerCase()
    const cleaned =
      url
        .replace(filter, '')
        .replace(/-{2,}/g, '-') // collapse double-dashes (middle removal)
        .replace(/\/-/g, '/') // remove leading dash after slash
        .replace(/-\//g, '/') // remove trailing dash before slash
        .replace(/-$/g, '') // remove trailing dash at end
        .replace(/\/$/g, '') // remove trailing slash (full segment removed)
        .replace(/_+/g, '_')
        .replace(/\/_/g, '/')
        .replace(/_$/, '') || '/'

    // Remove path segments that are now only trivial/no-op filter tokens
    window.location.href =
      '/' +
        cleaned
          .split('/')
          .filter((s) => s && !allTrivialTokens(s))
          .join('/') || '/'
  }

  const deleteTypeFilter = (segment: string) => {
    const url = window.location.pathname.toLowerCase()
    window.location.href = url.replace(segment, 'condos')
  }

  const deleteSearch = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    window.location.href = url.toString()
  }

  if (!customFilters.length && !typeFilters.length && !newFilter && !search)
    return null

  return (
    <Stack
      width="100%"
      spacing={2}
      direction="row"
      alignItems="center"
      justifyContent="center"
    >
      {newFilter && (
        <FilterChip
          label={`year: ${new Date().getFullYear() - 5}+`}
          noFormat
          onDelete={() => deleteFilter('new')}
        />
      )}
      {customFilters.map((filter) => (
        <FilterChip
          key={filter}
          label={filter}
          onDelete={() => deleteFilter(filter)}
        />
      ))}
      {typeFilters.map((segment) => (
        <FilterChip
          key={segment}
          label={`search: ${typeSearchMap[segment]}`}
          noFormat
          onDelete={() => deleteTypeFilter(segment)}
        />
      ))}
      {search && (
        <FilterChip label={`Keywords: ${search}`} onDelete={deleteSearch} />
      )}
    </Stack>
  )
}
