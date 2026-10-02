import React from 'react'

import { primary, secondary } from '@configs/colors'

import { TrendContainer } from './TrendContainer'
import { TrendContent } from './TrendContent'

interface PriceTrendCardProps {
  value: number | false
  title: string
  color?: 'primary' | 'secondary'
}

const PriceTrendCard = ({
  title,
  value,
  color = 'primary'
}: PriceTrendCardProps) => {
  const dividerColor = color === 'primary' ? primary : secondary
  const currencyColor = color === 'primary' ? secondary : primary

  return (
    <TrendContainer dividerColor={dividerColor}>
      <TrendContent title={title} value={value} currencyColor={currencyColor} />
    </TrendContainer>
  )
}

export default PriceTrendCard
