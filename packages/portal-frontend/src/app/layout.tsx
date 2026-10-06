import React, { type ComponentType } from 'react'
import { type Metadata, type Viewport } from 'next'
import { getLocale, getMessages } from 'next-intl/server'

import { GlobalStyles } from '@mui/material'

import content from '@configs/content'
import { primaryFont, secondaryFont } from '@configs/theme/fonts'
import globalStyles from '@configs/theme/global'
import { ChunkErrorReload, TrackingInline } from '@templates/components'

import 'styles/globals.css'

import { Providers } from './_providers'

export const metadata: Metadata = {
  ...content.siteMetadata,
  ...(content.noIndex && { robots: { index: false, follow: false } }),
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3000'
  )
}

export const viewport: Viewport = {
  themeColor: 'white',
  width: 'device-width',
  initialScale: 1
  // interactiveWidget: 'resizes-visual'
}

export type ProviderComponent = [ComponentType<any>, object?]

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale()
  const messages = await getMessages()

  const fontClasses = [primaryFont.variable, secondaryFont?.variable]
    .filter(Boolean)
    .join(' ')

  return (
    <html lang={locale} className={fontClasses}>
      <head>
        <ChunkErrorReload />
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body suppressHydrationWarning>
        <TrackingInline />
        <GlobalStyles styles={globalStyles} />
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default Layout
