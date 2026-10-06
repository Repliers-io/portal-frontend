'use client'

import React, { type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { type Map, type Marker, Popup } from 'mapbox-gl'

import gridConfig from '@configs/cards-grids'
import { BuildingCard } from '@shared/BuildingCard'

import { ThemeProvider } from '@mui/material/styles'
import theme from 'styles/theme'

type BuildingPopupData = {
  name: string
  address?: string
  imageUrl?: string
  href: string
}

export class BuildingPopupExtension {
  popup: Popup | null = null

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

  createPopupCard(data: BuildingPopupData): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <BuildingCard
          size="small"
          name={data.name}
          address={data.address}
          href={data.href}
          imageUrl={data.imageUrl}
        />
      </ThemeProvider>
    )
  }

  showPopup(data: BuildingPopupData, marker: Marker, map: Map): void {
    const content = this.createPopupCard(data)
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(content)

    // mapbox cant calculate popup width/height correctly,
    // so we have to set them manually
    const { width, height } = gridConfig.buildingCardSizes.small

    container.style.width = `${width}px`
    container.style.height = `${height}px`

    this.removePopup()
    this.insertPopup(marker, container, map)
  }
}

const buildingPopupExtensionInstance = new BuildingPopupExtension()
export default buildingPopupExtensionInstance
