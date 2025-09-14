import { useEffect, useState } from 'react'

import { Badge, Button } from '@mui/material'

import IcoAi from '@icons/IcoAi'

import { useDialog } from 'providers/DialogProvider'
import { useSearch } from 'providers/SearchProvider'
import { countAiQualityFilters } from 'utils/filters'

const AiQualityButton = ({ size }: { size: 'medium' | 'small' }) => {
  const { showDialog } = useDialog('filters')
  const { filters } = useSearch()

  const [qualitiesCounter, setQualitiesCounter] = useState(0)

  useEffect(() => {
    setQualitiesCounter(countAiQualityFilters(filters))
  }, [filters])

  return (
    <Badge
      color="secondary"
      badgeContent={qualitiesCounter}
      sx={{
        '& .MuiBadge-badge': { right: 4, top: 2, fontSize: 12 }
      }}
    >
      <Button
        size={size}
        color="secondary"
        variant="outlined"
        onClick={showDialog}
        startIcon={<IcoAi />}
        sx={
          size === 'small'
            ? {
                px: 1.5,
                minWidth: 32,
                display: { xs: 'block', sm: 'none' }
              }
            : { minWidth: 134, px: 2 }
        }
      >
        AI Quality
      </Button>
    </Badge>
  )
}

export default AiQualityButton
