'use client'

import React from 'react'

import { Grid } from '@mui/material'

import { BuildingSectionContainer } from '..'

import { InfoItemNumeric, InfoItemText } from './components'

export type BuildingInfoItem = {
  label: string
  value: string | number | null | undefined
  type: 'numeric' | 'text'
}

interface BuildingInfoProps {
  id?: string
  title: string
  items: BuildingInfoItem[]
}

export const BuildingInfo = ({ id, title, items }: BuildingInfoProps) => {
  const filteredItems = items.filter(
    (item): item is BuildingInfoItem & { value: string | number } =>
      !!item.value
  )

  if (!filteredItems.length) return null

  return (
    <BuildingSectionContainer id={id} title={title}>
      <Grid container spacing={{ xs: 2, sm: 4 }}>
        {filteredItems.map((item, index) => (
          <Grid size={{ xs: 12, sm: 4 }} key={index}>
            {item.type === 'numeric' ? (
              <InfoItemNumeric label={item.label} value={item.value} />
            ) : (
              <InfoItemText label={item.label} value={String(item.value)} />
            )}
          </Grid>
        ))}
      </Grid>
    </BuildingSectionContainer>
  )
}
