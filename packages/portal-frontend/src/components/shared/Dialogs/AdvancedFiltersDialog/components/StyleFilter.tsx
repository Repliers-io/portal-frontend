import { useEffect, useRef } from 'react'

import { Box, Stack, ToggleButton } from '@mui/material'

import {
  type StyleGroup,
  type StyleOption,
  type StyleOptions
} from '@defaults/filters'

import { SelectLabel } from 'components/atoms'

import { type Filters } from 'services/Search'
import { getBlockedStyleValues } from 'utils/filters'

export type { StyleGroup, StyleOption, StyleOptions }

const toEntry = (opt: StyleOption) =>
  typeof opt === 'string'
    ? { values: [opt], label: opt }
    : { values: [opt.value].flat() as string[], label: opt.label }

const toGroups = (opts: StyleOptions): StyleGroup[] =>
  opts.some((o) => typeof o === 'object' && 'options' in o)
    ? (opts as StyleGroup[])
    : [{ options: opts as StyleOption[] }]

export const StyleFilter = ({
  field = 'style',
  label,
  value,
  options,
  listingType,
  onChange
}: {
  field?: keyof Filters
  label: string
  value: string[] | undefined
  options: StyleOptions
  listingType?: Filters['listingType']
  onChange: (filters: Partial<Filters>) => void
}) => {
  const selected = [value || []].flat() as string[]
  const groups = toGroups(options)

  const blockedValues = getBlockedStyleValues(listingType, options)
  const blockedGroup = (group: StyleGroup) =>
    group.options
      .map(toEntry)
      .flatMap((e) => e.values)
      .some((v) => blockedValues.includes(v))

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const next = selected.filter((v) => !blockedValues.includes(v))
    if (next.length !== selected.length)
      onChangeRef.current({ [field]: next.length ? next : undefined })
  }, [listingType, selected])

  const toggle = (values: string[], multiSelect: boolean) => {
    const active = values.every((v) => selected.includes(v))
    const next = multiSelect
      ? active
        ? selected.filter((v) => !values.includes(v))
        : [...selected, ...values.filter((v) => !selected.includes(v))]
      : active
        ? []
        : values
    onChange({ [field]: next.length ? next : undefined })
  }

  if (!groups.some((g) => g.options.length)) return null

  return (
    <Stack spacing={3}>
      {groups.map((group, i) => {
        const blocked = blockedGroup(group)
        return (
          <Box key={i}>
            <SelectLabel sx={blocked ? { opacity: 0.38 } : undefined}>
              {group.title ?? label}
            </SelectLabel>
            <Stack
              spacing={1.5}
              flexWrap="wrap"
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              {group.options.map(toEntry).map(({ values, label: l }) => (
                <ToggleButton
                  key={values.join(',')}
                  value={values.join(',')}
                  selected={
                    !blocked && values.every((v) => selected.includes(v))
                  }
                  disabled={blocked}
                  onChange={() => toggle(values, group.multiSelect ?? false)}
                >
                  {l}
                </ToggleButton>
              ))}
            </Stack>
          </Box>
        )
      })}
    </Stack>
  )
}
