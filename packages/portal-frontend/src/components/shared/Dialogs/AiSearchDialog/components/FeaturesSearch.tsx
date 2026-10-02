import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'

import { AiIcon, ClipIcon } from '@configs/icons'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'

import { FeaturesHeader } from '.'

// Helper to split comma-separated values and trim
const splitByComma = (value: string): string[] => {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const FeaturesSearch = () => {
  const {
    submit,
    images: currentImages,
    features: currentFeatures
  } = useAiSearch()
  const { hideDialog } = useDialog('ai')
  const t = useTranslations('Dialogs')

  const inputRef = useRef<HTMLInputElement>(null)
  const [imageValue, setImageValue] = useState('')
  const [featureValue, setFieldValue] = useState('')

  // Display current features and images when dialog opens
  useEffect(() => {
    if (currentFeatures.length) {
      setFieldValue(currentFeatures.join(', '))
    }
  }, [currentFeatures])

  useEffect(() => {
    if (currentImages.length > 0) {
      setImageValue(currentImages.join(', '))
    }
  }, [currentImages])

  const addFeature = (value = '') => {
    const formattedValue = value.trim()
    if (!formattedValue) return

    const features = splitByComma(formattedValue)
    submit({ features })
    setFieldValue('')
    hideDialog()
  }

  const addImage = (value = '') => {
    const formattedValue = value.trim()
    if (!formattedValue) return

    const images = splitByComma(formattedValue)
    submit({ images })
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
          placeholder={t('AiSearch.describeFeaturesPlaceholder')}
          onChange={(e) => setFieldValue(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && addFeature(featureValue)}
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ pl: 2, height: 20 }}>
                  <AiIcon />
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
          {t('AiSearch.search')}
        </Button>
      </Stack>
      <Typography textAlign="center">{t('AiSearch.or')}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
        <TextField
          fullWidth
          variant="filled"
          value={imageValue}
          placeholder={t('AiSearch.pasteImageUrlPlaceholder')}
          onChange={(e) => setImageValue(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && addImage(imageValue)}
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ pl: 2, height: 20 }}>
                  <ClipIcon />
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
          {t('AiSearch.search')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default FeaturesSearch
