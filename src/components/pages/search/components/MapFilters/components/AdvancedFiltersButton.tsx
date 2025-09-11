import { useEffect, useState } from 'react'

import { Badge, Button, Skeleton } from '@mui/material'

import IcoSettings from '@icons/IcoSettings'

import { useDialog } from 'providers/DialogProvider'
import { useSearch } from 'providers/SearchProvider'
import useClientSide from 'hooks/useClientSide'
import { countAdvancedFilters } from 'utils/filters'

const AdvancedFiltersButton = ({ size }: { size: 'medium' | 'small' }) => {
  const clientSide = useClientSide()
  const { showDialog } = useDialog('filters')
  const { filters } = useSearch()

  const [filtersCounter, setFiltersCounter] = useState(0)

  useEffect(() => {
    setFiltersCounter(countAdvancedFilters(filters))
  }, [filters])

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 46, sm: 140 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  return (
    <Badge
      color="primary"
      badgeContent={filtersCounter}
      sx={{
        '& .MuiBadge-badge': { right: 4, top: 2, fontSize: 12 }
      }}
    >
      {size === 'medium' ? (
        <Button
          size="medium"
          variant="outlined"
          onClick={showDialog}
          startIcon={<IcoSettings />}
          sx={{ width: { xs: 46, sm: 140 } }}
        >
          Advanced
        </Button>
      ) : (
        <Button
          size="small"
          variant="outlined"
          onClick={showDialog}
          sx={{ display: { xs: 'block', sm: 'none' }, minWidth: 32, px: 1.5 }}
        >
          <IcoSettings />
        </Button>
      )}
    </Badge>
  )
}

export default AdvancedFiltersButton
