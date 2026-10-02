'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Box,
  CircularProgress,
  DialogContent,
  DialogTitle
} from '@mui/material'

import features from '@configs/features'
import filtersConfig from '@configs/filters'
import { DialogCloseButton } from '@shared/Dialogs/components'

import { type Filters } from 'services/Search'
import { useDialog } from 'providers/DialogProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { featuresTab } from 'utils/filters'

import { dialogName } from '../AdvancedFiltersDialog'

import { usePriceBuckets } from './usePriceBuckets'
import {
  AdvancedFiltersMenu,
  AdvancedFiltersTab,
  AiQualityFiltersTab,
  FilterActions,
  RawFilters
} from '.'

const { defaultAdvancedFilters } = filtersConfig

// the tab switch shows once the dialog has a second tab to offer
const tabBar = features.aiQuality || featuresTab

type FormProps = {
  onSubmit: () => void
  onReset: () => void
}

const FiltersContent = ({ onSubmit, onReset }: FormProps) => {
  const [tab, setTab] = useState('advanced')
  const { filters, setFilters, resetFilters } = useSearch()

  // all tabs share the one scrolling content box, so a switch starts the next at its top
  const contentRef = useRef<HTMLDivElement>(null)
  const switchTab = (value: string) => {
    setTab(value)
    contentRef.current?.scrollTo({ top: 0 })
  }

  const initialState = {
    ...defaultAdvancedFilters,
    ...filters
  }

  const [dialogState, setDialogState] = useState<Filters>(initialState)

  const handleDialogStateChange = (mutation: Partial<Filters>) => {
    setDialogState({
      ...dialogState,
      ...mutation
    })
  }

  const { count, buckets } = usePriceBuckets(dialogState)

  const handleReset = () => {
    resetFilters()
    setDialogState(defaultAdvancedFilters)
    onReset?.()
  }

  const handleSubmit = () => {
    setFilters({ ...filters, ...dialogState })
    onSubmit?.()
  }

  const t = useTranslations('Dialogs')

  const { hideDialog } = useDialog(dialogName)

  return (
    <>
      <DialogCloseButton
        onClose={hideDialog}
        sx={tabBar ? { top: 12, right: 12 } : {}}
      />

      {tabBar ? (
        <AdvancedFiltersMenu
          selected={tab}
          onChange={switchTab}
          dialogState={dialogState}
        />
      ) : (
        // use regular title/header for dialog window
        <DialogTitle>{t('AdvancedFilters.title')}</DialogTitle>
      )}

      {/* Under the tab switch the theme's `py` stays on (the switch sits between title
          and content), so it is dropped: every tab starts 16px below the switch, Features
          with its search docked there from the start */}
      <DialogContent ref={contentRef} sx={tabBar ? { pt: 0 } : undefined}>
        <Box sx={tabBar && tab !== 'features' ? { py: 2 } : { pb: 2 }}>
          {/* Every tab the switch offers stays mounted, the inactive ones hidden, so a
              switch keeps each tab's own state: the Features search, its open fields */}
          <Box hidden={tab !== 'advanced'}>
            <AdvancedFiltersTab
              priceBuckets={buckets}
              dialogState={dialogState}
              onChange={handleDialogStateChange}
              onSubmit={handleSubmit}
            />
          </Box>

          {features.aiQuality && (
            <Box hidden={tab !== 'image'}>
              <AiQualityFiltersTab
                dialogState={dialogState}
                onChange={handleDialogStateChange}
              />
            </Box>
          )}

          {featuresTab && (
            <Box hidden={tab !== 'features'}>
              <RawFilters
                dialogState={dialogState}
                onChange={handleDialogStateChange}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <FilterActions
        count={count}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export const AdvancedFiltersForm = (props: FormProps) => {
  const { position } = useMapOptions()
  const { hideDialog } = useDialog(dialogName)

  // The whole preview (listing count + price buckets) is queried within the map
  // viewport. Opened via ?dialog=filters the dialog can mount before the map
  // reports its bounds — gate the content on a ready viewport so the children
  // mount with bounds already present and fetch immediately.
  if (!position.bounds) {
    return (
      <>
        <DialogCloseButton onClose={hideDialog} />
        <DialogContent
          sx={{
            display: 'flex',
            // fill the drawer (its width is pinned on the paper) so the dialog
            // doesn't shrink to the spinner while the viewport loads; border-box keeps
            // the theme's side padding inside that width, or the spinner sits off-centre
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 240,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </DialogContent>
      </>
    )
  }

  return <FiltersContent {...props} />
}
