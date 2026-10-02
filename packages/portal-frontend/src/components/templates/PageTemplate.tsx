import { type ReactNode, Suspense } from 'react'
import Script from 'next/script'

import { Box, Stack, type SxProps, type Theme } from '@mui/material'

import contentConfig from '@configs/content'

import DialogWindows from './components/DialogWindows'
import Footer from './components/Footer'
import Header from './components/Header'

const thirdPartyScript = process.env.THIRD_PARTY_SCRIPT || ''
const customScripts = contentConfig.customScripts || []

export const PageTemplate = ({
  noHeader = false,
  noFooter = false,
  bgcolor = '',
  mainSx,
  children
}: {
  noHeader?: boolean
  noFooter?: boolean
  bgcolor?: string
  mainSx?: SxProps<Theme>
  children: ReactNode
}) => {
  return (
    <>
      <Suspense>
        <DialogWindows />
      </Suspense>
      <Stack direction="column" minHeight="100svh" bgcolor={bgcolor}>
        {!noHeader && <Header />}
        <Box component="main" flex={1} sx={mainSx}>
          {children}
        </Box>
        {!noFooter && <Footer />}
      </Stack>
      {/* Legacy third-party script from environment variable */}
      {thirdPartyScript && (
        <Script src={thirdPartyScript} strategy="lazyOnload" />
      )}
      {/* Custom scripts from instance config */}
      {customScripts.map((script, index: number) => {
        const key = script.id || `custom-script-${index}`
        const strategy = script.strategy || 'lazyOnload'

        if (script.type === 'external') {
          return (
            <Script
              key={key}
              id={key}
              src={script.src}
              strategy={strategy}
              async={script.async}
              defer={script.defer}
            />
          )
        }

        if (script.type === 'inline') {
          return (
            <Script key={key} id={key} strategy={strategy}>
              {script.code}
            </Script>
          )
        }

        return null
      })}
    </>
  )
}
