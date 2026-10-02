'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { type LocationStatsParams } from '@shared/Stats'

import { type ApiStatisticResponse } from 'services/API'

import { useWidgetData } from '../../hooks'
import { getLocationName } from '../../utils'

import WidgetsCard from './WidgetsCard'
import WidgetsPanelContainer from './WidgetsPanelContainer'

type WidgetsPanelProps = LocationStatsParams & {
  // Dashboard (tabbed) usage passes these; the estimate page does not.
  wrapThirdItem?: boolean
  tabsSlot?: React.ReactNode
  ssrData?: ApiStatisticResponse | null
}

export const WidgetsPanel = ({
  wrapThirdItem,
  tabsSlot,
  ssrData,
  ...params
}: WidgetsPanelProps) => {
  const t = useTranslations('Statistics')
  const name = getLocationName(params)

  const { propertyClass } = params
  const { widgets, loading } = useWidgetData(params, ssrData)

  const propertyClassString = Array.isArray(propertyClass)
    ? propertyClass.join(' / ')
    : propertyClass

  const values = (Object.keys(widgets) as Array<keyof typeof widgets>)
    .map((key) => widgets[key].values)
    .flat()
    .filter(Boolean)

  // check if there's at least one non-zero value to display
  if (!values.length) return null

  return (
    <WidgetsPanelContainer
      name={name}
      tabsSlot={tabsSlot}
      wrapThirdItem={wrapThirdItem}
      propertyClass={propertyClassString}
    >
      {Object.keys(widgets).map((key) => {
        const multiValue = !['activeListings', 'soldPrices'].includes(key)
        const data = widgets[key as keyof typeof widgets]
        const month = data.labels[0]

        const title = t(key, { propertyClass: propertyClassString })
        const tooltip = t(`${key}Tooltip`, {
          name,
          month,
          propertyClass: propertyClassString
        })

        return (
          <WidgetsCard
            key={key}
            name={key}
            data={data}
            title={title}
            tooltip={tooltip}
            loading={loading}
            multiValue={multiValue}
          />
        )
      })}
    </WidgetsPanelContainer>
  )
}
