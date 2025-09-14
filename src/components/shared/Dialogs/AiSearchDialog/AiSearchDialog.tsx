import { useState } from 'react'

import {
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

import { BaseResponsiveDialog } from '..'

import {
  FeaturesSearch,
  ImageFavoritesBrowser,
  InspirationsBrowser
} from './components'

type SearchMode = 'features' | 'inspirations' | 'favorites'

const dialogName = 'ai'

const AiSearchDialog = () => {
  const [mode, setMode] = useState<SearchMode>('inspirations')

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={{ sm: 660, md: 930 }}>
      <DialogTitle>AI Visual Search</DialogTitle>
      <DialogContent sx={{ px: { sm: 6 }, pb: { xs: 0, sm: 6 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center" width="100%">
          <ToggleButtonGroup
            exclusive
            value={mode}
            onChange={(_e, mode) => setMode(mode)}
            sx={{
              '& .MuiToggleButton-root': {
                minWidth: { sm: 140 },
                fontWeight: 400
              }
            }}
          >
            <ToggleButton value="inspirations">Inspirations</ToggleButton>
            <ToggleButton value="favorites">Favorites</ToggleButton>
            <ToggleButton value="features">Features</ToggleButton>
          </ToggleButtonGroup>

          {mode === 'inspirations' && <InspirationsBrowser />}

          {mode === 'favorites' && <ImageFavoritesBrowser />}

          {mode === 'features' && <FeaturesSearch />}
        </Stack>
      </DialogContent>
    </BaseResponsiveDialog>
  )
}

export default AiSearchDialog
