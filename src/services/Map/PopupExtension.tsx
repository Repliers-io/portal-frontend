'use client'

import React, { type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
// NOTE: controversial behavior - we are limiting features available
// for the PropertyCard popup by SSG generated payload
// We wouldn't be able to change them without redeploying the app
import { payload } from 'features'
import { type Map, type Marker, Popup } from 'mapbox-gl'
import { NextIntlClientProvider } from 'next-intl'

import gridConfig from '@configs/cards-grids'
import { timeZone } from '@configs/i18n'
import { PropertyCard } from '@shared/Property'

import { type Property } from 'services/API'
import FeaturesProvider from 'providers/FeaturesProvider'
import UserProfileProvider from 'providers/UserProvider'

import { ThemeProvider } from '@mui/material/styles'
import theme from 'styles/theme'

export class PopupExtension {
  popup: Popup | null = null
  private locale: string = 'en'
  private messages: any = {}

  setIntlProviderData(locale: string, messages: any): void {
    this.locale = locale
    this.messages = messages
  }

  removePopup(): void {
    if (this.popup) {
      this.popup.remove()
    }
  }

  insertPopup(marker: Marker, element: HTMLElement, map: Map): void {
    const popup = new Popup({
      offset: 30,
      closeButton: false,
      closeOnMove: true
    })

    popup.setDOMContent(element)
    popup.setLngLat(marker.getLngLat())
    popup.addTo(map)
    this.popup = popup
  }

  createPopupCard(property: Property): ReactElement {
    return (
      <NextIntlClientProvider
        locale={this.locale}
        messages={this.messages}
        timeZone={timeZone}
      >
        <ThemeProvider theme={theme}>
          <FeaturesProvider payload={payload}>
            <UserProfileProvider>
              <PropertyCard size="map" property={property} />
            </UserProfileProvider>
          </FeaturesProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    )
  }

  showPopup(property: Property, marker: Marker, map: Map): void {
    const content = this.createPopupCard(property)
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(content)

    // mapbox cant calculate popup' width/height correctly,
    // so we have to set them manually
    const { width, height } = gridConfig.propertyCardSizes.map
    container.style.width = `${width}px`
    container.style.height = `${height}px`

    this.removePopup()
    this.insertPopup(marker, container, map)
  }
}

const popupExtensionInstance = new PopupExtension()
export default popupExtensionInstance
