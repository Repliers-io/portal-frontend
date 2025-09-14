'use client'

import React, { type FormEvent, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField
} from '@mui/material'

import { enableClientsAddEstimate } from '@configs/estimate'
import routes from '@configs/routes'
import IcoSearch from '@icons/IcoSearch'

import { useAgentClients } from 'providers/AgentClientsProvider'

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('')

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
            placeholder="Search a Client..."
            variant="outlined"
            color="secondary"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IcoSearch color="text.primary" size={16} />
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
      {enableClientsAddEstimate && (
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
          Estimate
        </Button>
      )}
    </Stack>
  )
}

export default SearchBar
