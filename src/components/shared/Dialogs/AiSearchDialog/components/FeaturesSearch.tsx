import React, { useRef, useState } from 'react'

import { Box, Button, Stack, TextField } from '@mui/material'

import IcoAi from '@icons/IcoAi'
import IcoClip from '@icons/IcoClip'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'

import { FeaturesHeader } from '.'

const FeaturesSearch = () => {
  const features = useFeatures()
  const { submit } = useAiSearch()
  const { setLayout } = useMapOptions()
  const { hideDialog } = useDialog('ai')

  const inputRef = useRef<HTMLInputElement>(null)
  const [imageValue, setImageValue] = useState('')
  const [featureValue, setFieldValue] = useState('')

  const addFeature = (value = '') => {
    const formattedValue = value.trim()
    if (!formattedValue) return

    submit({ features: [formattedValue] })
    setFieldValue('')
    if (features.aiShowOnGrid) setLayout('grid')
    hideDialog()
  }

  const addImage = (value = '') => {
    const formattedValue = value.trim()
    if (!formattedValue) return

    submit({ images: [formattedValue] })
    hideDialog()
    setImageValue('')
  }

  return (
    <Stack spacing={1} alignItems="center" width="100%">
      <FeaturesHeader />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
        <TextField
          fullWidth
          variant="filled"
          inputRef={inputRef}
          value={featureValue}
          placeholder="Describe features"
          onChange={(e) => setFieldValue(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && addFeature(featureValue)}
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ pl: 2, height: 20 }}>
                  <IcoAi />
                </Box>
              )
            }
          }}
        />
        <Button
          disabled={!featureValue.length}
          variant="contained"
          onClick={() => addFeature(featureValue)}
          sx={{ minWidth: 120 }}
        >
          Search
        </Button>
      </Stack>
      <Box textAlign="center">or</Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
        <TextField
          fullWidth
          variant="filled"
          value={imageValue}
          placeholder="Paste an image URL"
          onChange={(e) => setImageValue(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && addImage(imageValue)}
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ pl: 2, height: 20 }}>
                  <IcoClip />
                </Box>
              )
            }
          }}
        />
        <Button
          disabled={!imageValue.length}
          variant="contained"
          onClick={() => addImage(imageValue)}
          sx={{ minWidth: 120 }}
        >
          Search
        </Button>
      </Stack>
    </Stack>
  )
}

export default FeaturesSearch
