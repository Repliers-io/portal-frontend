'use client'
import { type ComponentType, type ReactNode, useMemo } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import type React from 'react'

import { ThemeProvider } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'

import i18nConfig from '@configs/i18n'

import { type ApiLocations } from 'services/API'
import DialogProvider from 'providers/DialogProvider'
import FavoritesProvider from 'providers/FavoritesProvider'
import FeaturesProvider from 'providers/FeaturesProvider'
import ImageFavoritesProvider from 'providers/ImageFavoritesProvider'
import LocationsProvider from 'providers/LocationsProvider'
import SaveSearchProvider from 'providers/SaveSearchProvider'
import SnackbarProvider from 'providers/SnackbarProvider'
import UserProvider from 'providers/UserProvider'
import { createGrowthBook, getFeatureValues } from 'utils/features'

import theme from 'styles/theme'

const devMode = process.env.NEXT_PUBLIC_GROWTHBOOK_DEV_MODE === 'true'

type ProviderComponent = [ComponentType<{ children: ReactNode }>, object?]

const buildProvidersTree = (componentsWithProps: Array<ProviderComponent>) => {
  const initialComponent = ({ children }: { children: ReactNode }) => children
  return componentsWithProps.reduce(
    (AccumulatedComponents, [Provider, props = {}]) => {
      const ComponentWithProvider = ({ children }: { children: ReactNode }) => (
        <AccumulatedComponents>
          <Provider {...props}>{children}</Provider>
        </AccumulatedComponents>
      )
      return ComponentWithProvider
    },
    initialComponent
  )
}
const { timeZone } = i18nConfig

type ProvidersProps = {
  locale: string
  features: Record<string, unknown>
  featureOptions?: Record<string, unknown>
  locations?: ApiLocations | null
  messages: Record<string, unknown>
  children: ReactNode
}

const Providers = ({
  features,
  featureOptions,
  locations,
  locale,
  messages,
  children
}: ProvidersProps) => {
  const providers = useMemo(() => {
    const { payload } = featureOptions || {}
    // parse payload and use it to dynamically enable context providers
    // payload on the client side would be mixed with the forced features from browser plugin
    if (devMode && payload) {
      const gb = createGrowthBook()
      gb.initSync({ payload })
      // eslint-disable-next-line no-param-reassign
      features = getFeatureValues(gb)
    }

    return [
      [NextIntlClientProvider, { locale, messages, timeZone }],
      [AppRouterCacheProvider],
      [ThemeProvider, { theme }],
      [UserProvider],
      [DialogProvider],
      [SnackbarProvider],
      [FeaturesProvider, featureOptions],
      features.search ? [LocationsProvider, { locations }] : false,
      features.favorites ? [FavoritesProvider] : false,
      features.saveSearch ? [SaveSearchProvider] : false,
      features.imageFavorites ? [ImageFavoritesProvider] : false
    ].filter(Boolean) as ProviderComponent[]
  }, [locations, featureOptions, features, locale, messages])

  const ProvidersTree = buildProvidersTree(providers)

  return <ProvidersTree>{children}</ProvidersTree>
}

export default Providers
