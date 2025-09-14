import React from 'react'
import { usePathname } from 'next/navigation'

import { Box } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

const AutosuggestionContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const clientSide = useClientSide()
  const { mobile, tablet } = useBreakpoints()
  if (!clientSide || (!mobile && !tablet)) return null
  if (pathname === '/') return null

  return (
    <Box
      sx={{
        maxWidth: 320,
        flex: 1,
        '& .MuiAutocomplete-root .MuiFilledInput-root': {
          backgroundColor: 'white'
        },
        '& .MuiAutocomplete-root .MuiFilledInput-root.Mui-focused': {
          backgroundColor: 'white'
        }
      }}
    >
      {children}
    </Box>
  )
}
export default AutosuggestionContainer
