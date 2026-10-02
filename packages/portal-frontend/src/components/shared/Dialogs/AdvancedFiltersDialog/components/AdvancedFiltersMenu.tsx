import { useTranslations } from 'next-intl'

import { DialogTitle, MenuList } from '@mui/material'

import features from '@configs/features'
import { AiIcon, FeaturesIcon, SettingsIcon } from '@configs/icons'

import { type Filters } from 'services/Search'
import {
  countAdvancedFilters,
  countAiQualityFilters,
  featuresTab,
  selectedRawFields
} from 'utils/filters'
import { firstWord } from 'utils/strings'

import { AdvancedFiltersMenuItem } from './AdvancedFiltersMenuItem'

// the tabs fit narrow dialogs by their labels' first words: "Advanced filters" → "Advanced"
export const AdvancedFiltersMenu = ({
  selected,
  dialogState,
  onChange
}: {
  selected: string
  dialogState: Filters
  onChange: (tab: string) => void
}) => {
  const t = useTranslations('Dialogs.AdvancedFilters')
  const aiFiltersCount = countAiQualityFilters(dialogState)
  // the raw fields count under their own tab, not under Advanced
  const featuresCount = selectedRawFields(dialogState).length
  const advFiltersCount = countAdvancedFilters(dialogState) - featuresCount

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
          startIcon={<SettingsIcon color="currentColor" />}
        >
          {firstWord(t('advancedFiltersTab'))}
        </AdvancedFiltersMenuItem>

        {features.aiQuality && (
          <AdvancedFiltersMenuItem
            count={aiFiltersCount}
            activeColor="secondary"
            selected={selected === 'image'}
            onClick={() => onChange('image')}
            startIcon={<AiIcon />}
          >
            {firstWord(t('qualityFiltersTab'))}
          </AdvancedFiltersMenuItem>
        )}

        {featuresTab && (
          <AdvancedFiltersMenuItem
            count={featuresCount}
            selected={selected === 'features'}
            onClick={() => onChange('features')}
            startIcon={<FeaturesIcon sx={{ fontSize: 22 }} />}
          >
            {firstWord(t('features'))}
          </AdvancedFiltersMenuItem>
        )}
      </MenuList>
    </DialogTitle>
  )
}
