import { useTranslations } from 'next-intl'

import { DialogTitle, MenuList } from '@mui/material'
import { red } from '@mui/material/colors'

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
import { useAdvancedFilterSlots } from './useAdvancedFilterSlots'

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
  // on phones the tab also holds the bar's own filters (beds, baths)
  const slots = useAdvancedFilterSlots()
  const advFiltersCount =
    countAdvancedFilters(dialogState, slots) - featuresCount

  return (
    <DialogTitle
      sx={{
        py: '0 !important',
        pl: { xs: 1, sm: 2, md: 4 },
        boxShadow: 1,
        // the shadow falls over the Features search docked under the bar (z-index 3)
        position: 'relative',
        zIndex: 4
      }}
    >
      <MenuList
        sx={{
          display: 'flex',
          // the free room splits into equal gaps between the tabs
          justifyContent: 'space-between',
          py: { xs: 1, sm: 1.75 },
          // the tabs shrink into the room the title's right padding leaves the close
          // button; MUI's Badge root, which wraps each tab, is `flex-shrink: 0`
          '& > .MuiBadge-root': { minWidth: 0, flexShrink: 1 }
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
            selectedColor={red[900]}
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
