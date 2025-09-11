import { type ReactNode, Suspense } from 'react'

import { Box, Stack } from '@mui/material'

import { LoadingView } from 'components/atoms'

import DialogWindows from './components/DialogWindows'
import Footer from './components/Footer'
import Header from './components/Header'

const PageTemplate = ({
  loading = false,
  noHeader = false,
  noFooter = false,
  bgcolor = '',
  children
}: {
  loading?: boolean
  noHeader?: boolean
  noFooter?: boolean
  bgcolor?: string
  children: ReactNode
}) => {
  return (
    <>
      <Suspense>
        <DialogWindows />
      </Suspense>
      <Stack direction="column" minHeight="100svh" bgcolor={bgcolor}>
        {!noHeader && <Header />}
        {loading ? (
          <LoadingView noHeader={noHeader} />
        ) : (
          <Box flex={1}>{children}</Box>
        )}
        {!noFooter && <Footer />}
      </Stack>
    </>
  )
}

export default PageTemplate
