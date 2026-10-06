'use client'

import { type ReactNode, type SyntheticEvent, useState } from 'react'

import {
  Checkbox,
  ListItemText,
  MenuItem,
  type SelectChangeEvent,
  Skeleton,
  type SxProps
} from '@mui/material'

import useClientSide from 'hooks/useClientSide'

import PatchedSelect from './PatchedSelect'

export type FilterSelectProps<T extends string> = {
  size: 'medium' | 'small'
  items: readonly T[]
  multiItems?: readonly T[]
  value: T | T[] | undefined
  fallback: T
  exclusiveItem?: T
  formatItem: (item: T) => string
  renderMultiValue?: (
    selected: T[],
    formatItem: (item: T) => string
  ) => ReactNode
  onChange: (value: T | T[]) => void
  multiSelect?: boolean
  changeAfterClose?: boolean
  requireSelection?: boolean
  disabled?: boolean
  sx?: SxProps
}

export const defaultRenderMultiValue = <T extends string>(
  selected: T[],
  formatItem: (item: T) => string
): string => {
  if (selected.length === 0) return ''
  if (selected.length === 1) return formatItem(selected[0])
  return `${formatItem(selected[0])} +${selected.length - 1}`
}

export const FilterSelect = <T extends string>({
  size,
  items,
  multiItems,
  value,
  fallback,
  exclusiveItem,
  formatItem,
  renderMultiValue = defaultRenderMultiValue,
  onChange,
  multiSelect,
  changeAfterClose,
  requireSelection = true,
  disabled,
  sx
}: FilterSelectProps<T>) => {
  const clientSide = useClientSide()
  const [draft, setDraft] = useState<T[] | null>(null)

  if (!clientSide) {
    return (
      <Skeleton variant="rounded" sx={{ height: { xs: 38, sm: 48 }, ...sx }} />
    )
  }

  if (multiSelect) {
    const normalized = ([value].flat() as T[]).filter(Boolean)
    const safeValue = normalized.length ? normalized : [fallback]
    const displayValue = changeAfterClose ? (draft ?? safeValue) : safeValue

    const resolveNewValues = (newValues: T[]): T[] | null => {
      if (newValues.length === 0) {
        if (requireSelection) return null
        return [fallback]
      }

      if (exclusiveItem) {
        const exclusiveAdded =
          newValues.includes(exclusiveItem) &&
          !displayValue.includes(exclusiveItem)
        if (exclusiveAdded) return [exclusiveItem]
        const withoutExclusive = newValues.filter((v) => v !== exclusiveItem)
        return withoutExclusive.length ? withoutExclusive : [fallback]
      }

      return newValues
    }

    const handleChange = (e: SelectChangeEvent<T[]>) => {
      const resolved = resolveNewValues(e.target.value as T[])
      if (resolved === null) return
      if (changeAfterClose) {
        setDraft(resolved)
      } else {
        onChange(resolved)
      }
    }

    const handleOpen = changeAfterClose
      ? (_e: SyntheticEvent) => setDraft(null)
      : undefined

    const handleClose = changeAfterClose
      ? (_e: SyntheticEvent) => {
          if (draft !== null) {
            onChange(draft)
            setDraft(null)
          }
        }
      : undefined

    const renderValue = (selected: T[]) =>
      renderMultiValue(selected, formatItem)

    return (
      <PatchedSelect
        multiple
        size={size}
        value={displayValue}
        variant="filled"
        disabled={disabled}
        onChange={handleChange as any}
        renderValue={renderValue as any}
        onOpen={handleOpen}
        onClose={handleClose}
        sx={sx}
      >
        {(multiItems ?? items).map((item) => {
          const checked = displayValue.includes(item)
          return (
            <MenuItem key={item} value={item}>
              <Checkbox size="small" checked={checked} sx={{ ml: -1.25 }} />
              <ListItemText primary={formatItem(item)} />
            </MenuItem>
          )
        })}
      </PatchedSelect>
    )
  }

  const singleValue = (Array.isArray(value) ? value[0] : value) || fallback

  const handleChange = (e: SelectChangeEvent<T>) =>
    onChange(e.target.value as T)

  return (
    <PatchedSelect
      size={size}
      value={singleValue}
      variant="filled"
      disabled={disabled}
      onChange={handleChange as any}
      sx={sx}
    >
      {items.map((item) => (
        <MenuItem key={item} value={item}>
          {formatItem(item)}
        </MenuItem>
      ))}
    </PatchedSelect>
  )
}
