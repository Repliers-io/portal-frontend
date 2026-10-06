import { Box, Skeleton } from '@mui/material'

import { Autosuggestion } from '@templates/components/Header/components'

import useClientSide from 'hooks/useClientSide'

export const AutosuggestionField = () => {
  const clientSide = useClientSide()

  return (
    <Box
      sx={{
        flexGrow: 1,
        pr: 1.5,
        maxWidth: 352,
        display: { xs: 'none', md: 'block' },
        bgcolor: 'background.paper'
      }}
    >
      {clientSide ? (
        <Autosuggestion showButton />
      ) : (
        <Skeleton height={48} width="100%" variant="rounded" />
      )}
    </Box>
  )
}
