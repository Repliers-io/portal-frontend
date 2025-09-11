'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { type LocationStatsParams } from '@shared/Stats'

import { useWidgetData } from '../../hooks'

import WidgetsCard from './WidgetsCard'
import WidgetsPanelContainer from './WidgetsPanelContainer'

const WidgetsPanel = (params: LocationStatsParams) => {
  const t = useTranslations('Statistics')
  const { name = '', ...searchParams } = params

  const { propertyClass } = searchParams
  const { widgets, loading } = useWidgetData(searchParams)

  return (
    <WidgetsPanelContainer name={name}>
      {Object.keys(widgets).map((key) => {
        const multiValue = !['activeListings', 'soldPrices'].includes(key)
        const data = widgets[key as keyof typeof widgets]
        const month = data.labels[0]

        const title = t(key, { propertyClass })
        const tooltip = t(`${key}Tooltip`, {
          name,
          month,
          propertyClass
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

export default WidgetsPanel
