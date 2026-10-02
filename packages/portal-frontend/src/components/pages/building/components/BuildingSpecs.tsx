'use client'

import { useTranslations } from 'next-intl'

import { useBuilding } from 'providers/BuildingProvider'

import { BuildingInfo } from './BuildingInfo'

export const BuildingSpecs = () => {
  const t = useTranslations('Building')
  const { specs } = useBuilding()

  return <BuildingInfo id="info" title={t('infoTitle')} items={specs} />
}
