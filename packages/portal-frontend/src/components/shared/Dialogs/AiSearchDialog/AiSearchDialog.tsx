import { useEffect, useState } from 'react'
import React from 'react'
import { useTranslations } from 'next-intl'

import {
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

import { useAiSearch } from 'providers/AiSearchProvider'

import { BaseResponsiveDialog } from '..'

import {
  FeaturesSearch,
  ImageFavoritesBrowser,
  InspirationsBrowser
} from './components'

type SearchMode = 'features' | 'inspirations' | 'favorites'

const dialogName = 'ai'

// Helper to determine initial mode based on AI filters
const getAiSearchMode = (images: string[], features: string[]): SearchMode => {
  return images.length > 0 || features.length > 0 ? 'features' : 'inspirations'
}

export const AiSearchDialog = () => {
  const t = useTranslations()
  const { images, features } = useAiSearch()

  const [mode, setMode] = useState<SearchMode>(
    getAiSearchMode(images, features)
  )

  // Switch to features tab when AI filters are applied
  useEffect(() => {
    setMode(getAiSearchMode(images, features))
  }, [images, features])

  return (
    <BaseResponsiveDialog
      name={dialogName}
      maxWidth={{ sm: 660, md: 930 }}
      transition="slide"
    >
      <DialogTitle>{t('MapFilters.aiSearch')}</DialogTitle>
      <DialogContent sx={{ px: { sm: 6 }, pb: { xs: 0, sm: 6 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center" width="100%">
          <ToggleButtonGroup
            exclusive
            value={mode}
            className="dialog-switch"
            onChange={(_e, mode) => setMode(mode)}
            sx={{
              '& .MuiToggleButton-root': {
                minWidth: { sm: 140 },
                fontWeight: 400
              }
            }}
          >
            <ToggleButton value="inspirations">
              {t('Dialogs.AiSearch.inspirations')}
            </ToggleButton>
            <ToggleButton value="favorites">
              {t('Dialogs.AiSearch.favorites')}
            </ToggleButton>
            <ToggleButton value="features">
              {t('Dialogs.AiSearch.features')}
            </ToggleButton>
          </ToggleButtonGroup>

          {mode === 'inspirations' && <InspirationsBrowser />}

          {mode === 'favorites' && <ImageFavoritesBrowser />}

          {mode === 'features' && <FeaturesSearch />}
        </Stack>
      </DialogContent>
    </BaseResponsiveDialog>
  )
}
