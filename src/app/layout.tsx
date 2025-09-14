import React, { type ComponentType } from 'react'
import { type Metadata, type Viewport } from 'next'
import { getLocale, getMessages } from 'next-intl/server'

import { GlobalStyles } from '@mui/material'

import content from '@configs/content'
import globalStyles from '@configs/theme/global'
import TrackingInline from '@templates/TrackingInline'

import { APISearch } from 'services/API'
import { fetchFeatureOptions } from 'utils/features'

import 'styles/globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'

import Providers from './_providers'

const gbInitMode = process.env.NEXT_PUBLIC_GROWTHBOOK_INIT || 'ssg'

export const metadata: Metadata = content.siteMetadata

export const viewport: Viewport = {
  themeColor: 'white',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
  // interactiveWidget: 'resizes-visual'
}

export type ProviderComponent = [ComponentType<any>, object?]

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { features, options } = await fetchFeatureOptions(gbInitMode)

  const locations = features.search
    ? await APISearch.fetchLocations({
        next: { tags: ['locations'], revalidate: 86400 }
      })
    : null

  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body>
        <TrackingInline />
        <GlobalStyles styles={globalStyles} />
        <Providers
          locale={locale}
          messages={messages}
          features={features}
          featureOptions={options}
          locations={locations}
        >
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default Layout
