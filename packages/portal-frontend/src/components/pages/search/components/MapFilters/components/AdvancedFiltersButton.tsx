import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Badge, Button, Skeleton } from '@mui/material'

import { SettingsIcon } from '@configs/icons'

import { useDialog } from 'providers/DialogProvider'
import { useSearch } from 'providers/SearchProvider'
import useClientSide from 'hooks/useClientSide'
import { countAdvancedFilters, countAiQualityFilters } from 'utils/filters'

export const AdvancedFiltersButton = ({
  size
}: {
  size: 'medium' | 'small'
}) => {
  const t = useTranslations()
  const clientSide = useClientSide()
  const { showDialog } = useDialog('filters')
  const { filters, filtersDisabled } = useSearch()

  const [filtersCounter, setFiltersCounter] = useState(0)

  // the dialog holds both tabs, so the button counts the AI quality filters too
  useEffect(() => {
    setFiltersCounter(
      countAdvancedFilters(filters) + countAiQualityFilters(filters)
    )
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
          disabled={filtersDisabled}
          onClick={showDialog}
          startIcon={<SettingsIcon color="currentColor" />}
          sx={{ width: { xs: 46, sm: 140 } }}
        >
          {t('MapFilters.advancedFilters')}
        </Button>
      ) : (
        <Button
          size="small"
          variant="outlined"
          disabled={filtersDisabled}
          onClick={showDialog}
          sx={{
            display: { xs: 'inline-flex', sm: 'none' },
            px: { xs: 1.25, sm: 1.5 },
            minWidth: 32
          }}
        >
          <SettingsIcon color="currentColor" />
        </Button>
      )}
    </Badge>
  )
}
