'use client'
import { type ComponentType, type ReactNode, useMemo } from 'react'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'

import { ThemeProvider } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'

import features from '@configs/features'
import i18nConfig from '@configs/i18n'

import DialogProvider from 'providers/DialogProvider'
import FavoritesProvider from 'providers/FavoritesProvider'
import ImageFavoritesProvider from 'providers/ImageFavoritesProvider'
import SaveSearchProvider from 'providers/SaveSearchProvider'
import SnackbarProvider from 'providers/SnackbarProvider'
import UserProvider from 'providers/UserProvider'

import theme from 'styles/theme'

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
  messages: Record<string, unknown>
  children: ReactNode
}

export const Providers = ({ locale, messages, children }: ProvidersProps) => {
  // Feature gates are static (build-time, per tenant via @configs/features), so the
  // feature-dependent providers are decided once here — no runtime feature service.
  const providers = useMemo(
    () =>
      [
        [NextIntlClientProvider, { locale, messages, timeZone }],
        [AppRouterCacheProvider],
        [ThemeProvider, { theme }],
        [UserProvider],
        [DialogProvider],
        [SnackbarProvider],
        features.favorites ? [FavoritesProvider] : false,
        features.saveSearch ? [SaveSearchProvider] : false,
        features.imageFavorites ? [ImageFavoritesProvider] : false
      ].filter(Boolean) as ProviderComponent[],
    [locale, messages]
  )

  const ProvidersTree = useMemo(
    () => buildProvidersTree(providers),
    [providers]
  )

  return <ProvidersTree>{children}</ProvidersTree>
}
