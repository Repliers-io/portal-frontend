import { MenuItem, Skeleton } from '@mui/material'

import { type ListingType, listingTypes } from '@configs/filters'

import Select from 'components/atoms/PatchedSelect'

import useClientSide from 'hooks/useClientSide'
import { formatUnionKey } from 'utils/strings'

const ListingTypeSelect = ({
  size,
  value,
  onChange
}: {
  size: 'medium' | 'small'
  disabled?: boolean
  value: ListingType
  onChange: (newValue: ListingType) => void
}) => {
  const clientSide = useClientSide()

  const handleChange = (e: any) => {
    const value = e.target.value as ListingType
    onChange?.(value)
  }

  if (!clientSide)
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 130, sm: 148 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )

  return (
    <Select
      size={size}
      value={value}
      variant="filled"
      onChange={handleChange}
      sx={{
        width: { xs: 130, sm: 148 }
      }}
    >
      {listingTypes.map((type) => (
        <MenuItem key={type} value={type}>
          {formatUnionKey(type)}
        </MenuItem>
      ))}
    </Select>
  )
}

export default ListingTypeSelect
