'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack } from '@mui/material'

import { useBuilding } from 'providers/BuildingProvider'
import { formatFullAddress } from 'utils/listings'

import {
  BuildingContactForm,
  BuildingHeader,
  BuildingMainContent,
  BuildingSidebarContainer
} from './components'

export const BuildingPageContent = () => {
  const t = useTranslations('Forms')
  const tBuilding = useTranslations('Building')
  const building = useBuilding()

  const initialMessage = useMemo(() => {
    const parts: string[] = []
    if (building.name) parts.push(building.name)
    if (building.address) {
      const addr = formatFullAddress(building.address as any, true)
      if (addr) parts.push(addr)
    }
    const info = parts.join(' at ')
    return info ? `${t('contactMessagePrefix')} ${info}` : ''
  }, [building, t])

  const contactTitle = useMemo(() => {
    const target =
      building.name ||
      (building.address ? formatFullAddress(building.address as any, true) : '')
    return target
      ? tBuilding('contactQuestion', { building: target })
      : undefined
  }, [building, tBuilding])

  return (
    <Stack spacing={2} pb={4}>
      <BuildingHeader />

      <Container>
        <Stack
          spacing={4}
          width="100%"
          alignItems="flex-start"
          justifyContent="space-between"
          direction={{ xs: 'column', md: 'row' }}
        >
          <BuildingMainContent />

          <BuildingSidebarContainer>
            <BuildingContactForm
              initialMessage={initialMessage}
              title={contactTitle}
            />
          </BuildingSidebarContainer>
        </Stack>
      </Container>
    </Stack>
  )
}
