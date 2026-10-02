'use client'

import { Stack, Typography } from '@mui/material'

const SearchBar = () => {
  return (
    <Stack direction="row" gap={2} justifyContent="space-between">
      <Typography component="h3" variant="h3">
        Agents list
      </Typography>
    </Stack>
  )
}

export default SearchBar
