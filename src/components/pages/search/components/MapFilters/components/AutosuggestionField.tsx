import { Box, Skeleton } from '@mui/material'

import { Autosuggestion } from '@templates/Header/components'

import useClientSide from 'hooks/useClientSide'

const SearchField = () => {
  const clientSide = useClientSide()

  return (
    <Box sx={{ flexGrow: 1, pr: 1.5, display: { xs: 'none', md: 'block' } }}>
      {clientSide ? (
        <Autosuggestion showButton />
      ) : (
        <Skeleton height={48} width="100%" variant="rounded" />
      )}
    </Box>
  )
}

export default SearchField
