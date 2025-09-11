import { useEffect, useState } from 'react'

import { DialogTitle, MenuList } from '@mui/material'

import IcoAi from '@icons/IcoAi'
import IcoSettings from '@icons/IcoSettings'

import { type Filters } from 'services/Search'
import { countAdvancedFilters, countAiQualityFilters } from 'utils/filters'

import AdvancedFiltersMenuItem from './AdvancedFiltersMenuItem'

const AdvancedFiltersMenu = ({
  selected,
  dialogState,
  onChange
}: {
  selected: string
  dialogState: Filters
  onChange: (tab: string) => void
}) => {
  const [aiFiltersCount, setAiFiltersCount] = useState(0)
  const [advFiltersCount, setAdvFiltersCount] = useState(0)

  useEffect(() => {
    const aiFilters = countAiQualityFilters(dialogState)
    const allFilters = countAdvancedFilters(dialogState)
    const advFilters = allFilters - aiFilters

    setAiFiltersCount(aiFilters)
    setAdvFiltersCount(advFilters)
  }, [dialogState])

  return (
    <DialogTitle
      sx={{
        py: '0 !important',
        pl: { xs: 1, sm: 2, md: 4 },
        boxShadow: 1
      }}
    >
      <MenuList
        sx={{
          display: 'flex',
          py: { xs: 1, sm: 1.75 },
          gap: { xs: 1, sm: 2 }
        }}
      >
        <AdvancedFiltersMenuItem
          count={advFiltersCount}
          selected={selected === 'advanced'}
          onClick={() => onChange('advanced')}
          startIcon={<IcoSettings color="currentColor" />}
        >
          Advanced Filters
        </AdvancedFiltersMenuItem>

        <AdvancedFiltersMenuItem
          count={aiFiltersCount}
          activeColor="secondary"
          selected={selected === 'image'}
          onClick={() => onChange('image')}
          startIcon={<IcoAi />}
        >
          Quality Filters
        </AdvancedFiltersMenuItem>
      </MenuList>
    </DialogTitle>
  )
}

export default AdvancedFiltersMenu
