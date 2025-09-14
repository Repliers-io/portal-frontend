import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DialogContent } from '@mui/material'

import PropertyPageContent from '@pages/listing'

import { ContentShadow, LoadingView } from 'components/atoms'

import { APIPropertyDetails, type Property } from 'services/API'
import { useDialog } from 'providers/DialogProvider'
import PropertyDetailsProvider from 'providers/PropertyDetailsProvider'
import PropertyProvider from 'providers/PropertyProvider'
import { getSeoTitle, getSeoUrl } from 'utils/properties'
import { updateWindowHistory } from 'utils/urls'

import { DialogCloseButton, DialogDrawer } from '../components'

import {
  NavigationControls,
  PropertyTitle,
  StaticPageButton
} from './components'

export const dialogName = 'property'

const PropertyDialog = ({
  active,
  mapType = 'interactive',
  properties
}: {
  active: number
  mapType?: 'interactive' | 'static'
  properties: Property[]
}) => {
  const originalUrl = useRef('')
  const originalTitle = useRef('')
  const [scrollY, setScrollY] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [cachedActive, setCachedActive] = useState(active)
  const [cachedProperty, setCachedProperty] = useState<Property | null>(null)
  const { visible, hideDialog } = useDialog(dialogName)

  const fetchFullPropertyData = async (property: Property) => {
    try {
      const response = await APIPropertyDetails.fetchProperty(
        property.mlsNumber,
        property.boardId
      )
      setCachedProperty(response)
    } catch (error) {
      console.error('Error fetching additional data:', error)
    }
  }

  const updateCachedProperty = useCallback(
    (property: Property) => {
      if (!property) return
      // update the URL and the title
      updateWindowHistory(getSeoUrl(property))
      document.title = getSeoTitle(property)

      setCachedProperty(property)
      fetchFullPropertyData(property)
    },
    [properties]
  )

  const prev = cachedActive > 0 && properties.length > 0
  const next = cachedActive >= 0 && cachedActive < properties.length - 1

  const { mlsNumber, raw } = cachedProperty || {}
  const propertyKey = (mlsNumber || '') + '-' + Object.keys(raw || {}).length

  const handleNavigationClick = (step: number) => {
    const cachedProperty = properties[cachedActive + step]

    setCachedActive(cachedActive + step)
    updateCachedProperty(cachedProperty)
    contentRef.current?.scrollTo(0, 0)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop)
  }

  useEffect(() => {
    if (visible) {
      setScrollY(0)
      originalUrl.current = window.location.href
      originalTitle.current = document.title
    } else {
      if (originalUrl.current) {
        document.title = originalTitle.current
        updateWindowHistory(originalUrl.current)
      }
    }
  }, [visible])

  // properties array/index changed outside of the component, clear the caches
  useEffect(() => {
    const activeProperty = properties[active]

    setCachedProperty(null)
    setCachedActive(active)
    if (activeProperty) updateCachedProperty(activeProperty)
  }, [active, properties])

  return (
    <DialogDrawer dialogName={dialogName} maxWidth={{ xs: '100%', lg: 1296 }}>
      {cachedProperty ? (
        <PropertyProvider key={propertyKey} property={cachedProperty}>
          <PropertyDetailsProvider property={cachedProperty}>
            <DialogCloseButton onClose={hideDialog} />
            <StaticPageButton />
            <NavigationControls
              next={next}
              prev={prev}
              onClick={handleNavigationClick}
            />
            <PropertyTitle property={cachedProperty} />
            <ContentShadow visible={scrollY > 0} />
            <DialogContent
              ref={contentRef}
              onScroll={handleScroll}
              id={`${dialogName}-content`}
              sx={{ overflowX: 'hidden', px: '8px !important' }}
            >
              <PropertyPageContent embedded mapType={mapType} />
            </DialogContent>
          </PropertyDetailsProvider>
        </PropertyProvider>
      ) : (
        <DialogContent>
          <LoadingView />
        </DialogContent>
      )}
    </DialogDrawer>
  )
}

export default PropertyDialog
