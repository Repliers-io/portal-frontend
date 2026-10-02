'use client'

import React, { type FormEvent, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField
} from '@mui/material'

import estimateConfig from '@configs/estimate'
import { AddIcon, CloseIcon, SearchIcon } from '@configs/icons'
import routes from '@configs/routes'

import { useAgentClients } from 'providers/AgentClientsProvider'

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('')
  const t = useTranslations('Agent')

  const { fetchClients } = useAgentClients()

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()

    const params = searchValue ? { keywords: searchValue } : undefined

    fetchClients(params)
  }

  const handleClear = () => {
    setSearchValue('')
    fetchClients()
  }

  return (
    <Stack
      display="grid"
      gridTemplateColumns="minmax(200px, 300px) auto"
      gap={2}
      justifyContent="space-between"
    >
      <form onSubmit={handleSearch}>
        <Stack gap={2} direction="row">
          <TextField
            fullWidth
            name="search"
            placeholder={t('searchClient')}
            variant="outlined"
            color="secondary"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="text.primary" size={16} />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <IconButton onClick={handleClear}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper'
              },
              '& .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: 'divider'
                }
            }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.trim())}
          />
        </Stack>
      </form>
      {estimateConfig.enableClientsAddEstimate && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href={routes.estimate}
          sx={{
            '& .MuiButton-startIcon': {
              display: {
                xs: 'none',
                sm: 'block'
              }
            }
          }}
        >
          {t('estimateButton')}
        </Button>
      )}
    </Stack>
  )
}

export default SearchBar
