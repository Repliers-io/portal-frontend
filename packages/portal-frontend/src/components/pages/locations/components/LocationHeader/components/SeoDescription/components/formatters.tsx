'use client'

import React from 'react'

import { Typography } from '@mui/material'

import { ScrubbedSkeleton } from 'components/atoms/ScrubbedText'

import useClientSide from 'hooks/useClientSide'

export const Bold = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="body2"
    component="span"
    fontWeight={600}
    color="text.default"
  >
    {children}
  </Typography>
)

export const Counter = ({ count }: { count: number | undefined }) => {
  const clientSide = useClientSide()
  if (!count) return null
  if (!clientSide)
    return <ScrubbedSkeleton value={count.toLocaleString('en-GB')} />
  return <Bold>{count.toLocaleString('en-GB')}</Bold>
}

export const LocationsList = ({ items }: { items: React.ReactNode[] }) => (
  <>
    {items.map((item, index) => {
      const hasComma = index < items.length - 1
      return (
        <React.Fragment key={index}>
          <span style={{ whiteSpace: 'nowrap' }}>
            {item}
            {hasComma && ','}
          </span>
          {hasComma && ' '}
        </React.Fragment>
      )
    })}
  </>
)
